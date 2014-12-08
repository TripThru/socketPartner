var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var IFleet = require('./fleet').IFleet;
var Fleet = require('./fleet').Fleet;
var logger = require('./logger');
var store = require('./models/trips');
var TripThruApiFactory = require('./tripthru_api_factory');
var codes = require('./codes');
var Promise = require('bluebird');
var PromiseHelper = require('./promise_helper');
var resultCodes = codes.resultCodes;

function Partner(config) {
  
  if(!config.id) {
    throw new Error('Id is required');
  }
  if(!config.name) {
    throw new Error('Name is required');
  }
  if(!config.gatewayClient) {
    throw new Error('GatewayClient instance is required');
  }
  if(!config.fleets || config.fleets.length === 0) {
    throw new Error('At least one fleet is required');
  }
  
  Gateway.call(this, config.id, config.name);
  Interface.ensureImplements(config.gatewayClient, IGateway);
  for(var i = 0; i < config.fleets.length; i++) {
    Interface.ensureImplements(config.fleets[i], IFleet);
  }
  
  this.gatewayClient = config.gatewayClient;
  this.fleets = config.fleets;
  this.fleetsById = {};
  for(var j = 0; j < config.fleets.length; j++) {
    var fleet = config.fleets[j];
    this.fleetsById[fleet.id] = fleet;
    fleet.setPartner(this);
  }
  this.preferedPartnerId = config.preferedPartnerId;
  this.activeTripsByPublicId = {};
}

Partner.prototype.getPartnerInfo = function(request, cb) {
  cb(TripThruApiFactory.createGetPartnerInfoResponse(this.fleets));
};

Partner.prototype.dispatchTrip = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'dispatch');
  
  if(this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Already exists', resultCodes.rejected));
    return;
  }
  if (trip.driver && trip.driver.id) {
    this.dispatchToSpecificDriver(trip, this.returnDispatchTripResponse(trip, cb));
  } else if(trip.fleet && trip.fleet.id) {
    this.dispatchToSpecificFleet(trip, this.returnDispatchTripResponse(trip, cb));
  } else {
    this.dispatchToFirstFleetThatServes(trip, this.returnDispatchTripResponse(trip, cb));
  }
};

Partner.prototype.returnDispatchTripResponse = function(trip, cb) {
  var response;
  if(trip) {
    response = TripThruApiFactory.createResponseFromTrip(trip, 'dispatch');
  } else {
    response = TripThruApiFactory.createResponseFromTrip(null, null, 
        'Dispatch failed', resultCodes.rejected);
  }
  cb(response);
};

Partner.prototype.dispatchToSpecificDriver = function(trip, cb) {
  cb(null);
};

Partner.prototype.dispatchToSpecificFleet = function(trip, cb) {
  logger.log(trip.publicId, 'Dispatching to fleet ' + trip.fleet.id);
  var fleet = this.fleetsById[trip.fleet.id];
  if(!fleet) {
    cb(null);
  }
  
  if(fleet.servesLocation(trip.pickupLocation)) {
    fleet
      .createTrip(trip.passenger, trip.pickupTime, trip.pickupLocation, trip.dropoffLocation, trip.publicId)
      .then(function(t){
        var response = false;
        if(fleet.queueTrip(t)) {
          response = true;
          logger.log(t.id, 'DispatchTrip successful');
        }
        cb(response);
      });
  }
};

Partner.prototype.dispatchToFirstFleetThatServes = function(trip, cb) {
  logger.log(trip.publicId, 'Dispatching to first fleet that serves');
  for(var i = 0; i < this.fleets.length; i++) {
    var fleet = this.fleets[i];
    if(fleet.servesLocation(trip.pickupLocation)) {
      trip.fleet = { id: fleet.id, name: fleet.name };
      break;
    }
  }
  if(trip.fleet) {
    cb(this.dispatchToSpecificFleet(trip, cb));
  } else {
    cb(null);
  }
};

Partner.prototype.getTripStatus = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'get-trip-status');
  var response;
  if(!this.activeTripsById.hasOwnProperty(trip.publicId)) {
    response = TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound);
  } else {
    var t = this.activeTripsById[trip.publicId];
    response = TripThruApiFactory.createResponseFromTrip(t, 'get-trip-status');
    logger.log(t.id, 'Received get status request');
  }
  cb(response);
};

Partner.prototype.updateTripStatus = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'update-trip-status');
  
  if(this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound));
    return;
  }
  var t = this.activeTripsByPublicId[trip.publicId];
  t.updateStatus(false, trip.status, trip.driver.location, trip.eta);
  logger.log(t.id, 'Received status update (' + t.status + ')');
  cb(TripThruApiFactory.createResponseFromTrip(t, 'update-trip-status'));
};

Partner.prototype.getTrip = function(request, cb) {
  throw new Error('Not implemented');
};

Partner.prototype.quoteTrip = function(request, cb) {
  logger.log(request.id, 'QuoteTrip received');
  cb(TripThruApiFactory.createResponseFromQuoteRequest(request));
  
  TripThruApiFactory
    .createUpdateQuoteRequestFromQuoteRequest(request, this.fleets)
    .bind(this)
    .delay(500)
    .then(function(updateQuoteRequest){
      this.gatewayClient.updateQuote(updateQuoteRequest);
    });
};

Partner.prototype.updateQuote = function(request, cb) {
  throw new Error('Not implemented');
};

Partner.prototype.getQuote = function(request, cb) {
  throw new Error('Not implemented');
};

Partner.prototype.update = function() {
  return PromiseHelper.runInSequence(this.fleets, function(fleet){
    return fleet.simulate();
  });
};

Partner.prototype.tryToCreateLocalTripAtTripThru = function(trip) {
  logger.log(trip.id, 'Creating local trip in TripThru');
  return this.tryToDispatchToForeignProvider(trip, this.id);
};

Partner.prototype.tryToDispatchToForeignProvider = function(trip, partnerId) {
  var partner = partnerId ? {partner: {id: partnerId, name: partnerId}} : null;
  var request = 
    TripThruApiFactory.createRequestFromTrip(trip, 'dispatch', partner);
  return this
    .gatewayClient
    .dispatchTrip(request)
    .bind(this)
    .then(function(response){
      var success = response.result === resultCodes.ok;
      if(success) {
        if(partnerId === this.id) {
          logger.log(trip.id, 'Local trip was created in TripThru');
        } else {
          trip.service = 'foreign';
          logger.log(trip.id, 'Successfully dispatched through TripThru');
        }
      } else {
        logger.log(trip.id, 'Trip was rejected by TripThru');
      }
      return success;
    });
};

Partner.prototype.addTrip = function(trip) {
  this.activeTripsByPublicId[trip.publicId] = trip;
  store.createTrip(trip);
};

Partner.prototype.deactivateTrip = function(trip, status) {
  //store.updateTrip(trip); Fix bug
  delete this.activeTripsByPublicId[trip.publicId];
};

Partner.prototype.updateForeignPartner = function(trip) {
  var request = TripThruApiFactory.createRequestFromTrip(trip, 'update-trip-status');
  return this.gatewayClient.updateTripStatus(request);
};

function PartnerFactory() {
  
}

PartnerFactory.prototype.createPartner = function(gatewayClient, configuration) {
  var fleets = [];
  for(var i = 0; i < configuration.fleets.length; i++) {
    var fleet = configuration.fleets[i];
    fleet.simulationInterval = configuration.simulationInterval;
    fleets.push(new Fleet(fleet));
  }
  var partner = new Partner({
    id: configuration.clientId.replace(/ /g, ''),
    name: configuration.name,
    preferedPartnerId: configuration.preferedPartnerId,
    fleets: fleets,
    gatewayClient: gatewayClient
  });
  return partner;
};

module.exports.PartnerFactory = new PartnerFactory();