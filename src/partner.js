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

Partner.prototype.setPartnerInfoAtTripThru = function(cb) {
  var request = TripThruApiFactory.createGetPartnerInfoResponse(this.fleets);
  this
    .gatewayClient
    .setPartnerInfo(request)
    .then(function(res){
      cb(res);
    });
};

Partner.prototype.dispatchTrip = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'dispatch');
  logger.log(trip.publicId, this.id + ' received dispatch request');
  
  if(this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Already exists', resultCodes.rejected));
    return;
  }
  var dispatchPromise;
  if (trip.driver && trip.driver.id) {
    dispatchPromise = this.dispatchToSpecificDriver(trip);
  } else if(trip.fleet && trip.fleet.id) {
    dispatchPromise = this.dispatchToSpecificFleet(trip);
  } else {
    dispatchPromise = this.dispatchToFirstFleetThatServes(trip);
  }
  
  dispatchPromise
    .then(function(t){
      if(t) {
        logger.log(request.id, 'Dispatched successfully');
        cb(TripThruApiFactory.createResponseFromTrip(t, 'dispatch'));
      } else {
        logger.log(request.id, 'Dispatch unsuccessful');
        cb(TripThruApiFactory.createResponseFromTrip(null, null, 
            'Dispatch unsuccessful', resultCodes.rejected));
      }
    })
    .error(function(err){
      console.log(request.id, 'Dispatch error: ' + err);
      cb(TripThruApiFactory.createResponseFromTrip(null, null, 
            'Dispatch failed', resultCodes.rejected));
    });
};

Partner.prototype.dispatchToSpecificDriver = function(trip) {
  logger.log(trip.publicId, 'Dispatching to specific driver ' + trip.driver.id);
  throw new Error('Not implemented');
};

Partner.prototype.dispatchToSpecificFleet = function(trip) {
  logger.log(trip.publicId, 'Dispatching to fleet ' + trip.fleet.id);
  var fleet = this.fleetsById[trip.fleet.id];
  
  if(fleet && fleet.servesLocation(trip.pickupLocation)) {
    var t = fleet.createTrip(trip.passenger, trip.pickupTime, trip.pickupLocation, 
          trip.dropoffLocation, trip.publicId);
    if(fleet.queueTrip(t)) {
      return Promise.resolve(t);
    }
  }
  return Promise.resolve(null);
};

Partner.prototype.dispatchToFirstFleetThatServes = function(trip) {
  logger.log(trip.publicId, 'Dispatching to first fleet that serves');
  for(var i = 0; i < this.fleets.length; i++) {
    var fleet = this.fleets[i];
    if(fleet.servesLocation(trip.pickupLocation)) {
      trip.fleet = { id: fleet.id, name: fleet.name };
      break;
    }
  }
  if(trip.fleet) {
    return this.dispatchToSpecificFleet(trip);
  }
  Promise.resolve(null);
};

Partner.prototype.getTripStatus = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'get-trip-status');
  var response;
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    response = TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound);
  } else {
    var t = this.activeTripsByPublicId[trip.publicId];
    response = TripThruApiFactory.createResponseFromTrip(t, 'get-trip-status', 
        null, null, {partner: this});
    logger.log(t.id, this.id + ' received get status request');
  }
  cb(response);
};

Partner.prototype.updateTripStatus = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'update-trip-status');
  
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound));
    return;
  }
  var t = this.activeTripsByPublicId[trip.publicId];
  var driverLocation;
  if(trip.driver && trip.driver.location) {
    driverLocation = trip.driver.location;
  }
  t.updateStatus(false, trip.status, driverLocation, trip.eta);
  logger.log(t.id, this.id + ' received status update (' + request.status + ')');
  cb(TripThruApiFactory.createResponseFromTrip(t, 'update-trip-status'));
};

Partner.prototype.getTrip = function(request, cb) {
  throw new Error('Not implemented');
};

Partner.prototype.quoteTrip = function(request, cb) {
  logger.log(request.id, this.id + ' received quotetrip');
  cb(TripThruApiFactory.createResponseFromQuoteRequest(request));
  
  TripThruApiFactory
    .createUpdateQuoteRequestFromQuoteRequest(request, this.fleets)
    .bind(this)
    .delay(100)
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