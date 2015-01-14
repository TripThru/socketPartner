var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var IFleet = require('./fleet').IFleet;
var Fleet = require('./fleet').Fleet;
var logger = require('./logger');
var trips = require('./models/trips');
var quotes = require('./models/quotes');
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
      logger.log(request.id, 'Dispatch error: ' + err);
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
  logger.log(request.id, this.id + ' received quote update');
  quotes
    .getById(request.id)
    .bind({})
    .then(function(q){
      if(q) {
        this.quote = q;
        var partnerQuote = TripThruApiFactory.createQuoteFromRequest(request, 
            'update', {quote: q});
        return quotes.update(this.quote);
      }
      throw new Error('Quote not found');
    })
    .then(function(){
      var response = TripThruApiFactory.createResponseFromQuote(this.quote, 'update');
      cb(response);
    })
    .error(function(err){
      var response = TripThruApiFactory.createResponseFromQuote(null, null, 
          resultCodes.unknownError, 'unknown error ocurred');
      cb(response);
    });
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
  trips.createTrip(trip);
};

Partner.prototype.deactivateTrip = function(trip, status) {
  //trips.updateTrip(trip); Fix bug
  delete this.activeTripsByPublicId[trip.publicId];
};

Partner.prototype.updateForeignPartner = function(trip) {
  var request = TripThruApiFactory.createRequestFromTrip(trip, 'update-trip-status');
  return this.gatewayClient.updateTripStatus(request);
};

//This are helper function used only by the bookings website, to simulate a sync
//quoting process simplifying the bookings website adaptation to the Node api

Partner.prototype.bookingsQuoteTrip = function(request, cb) {
  var quote = TripThruApiFactory.createQuoteFromRequest(request, 'quote');
  quotes
    .getById(quote.id)
    .bind(this)
    .then(function(res){
      return quotes.add(quote);
    })
    .then(function(res){
      return this.gatewayClient.quoteTrip(request);
    })
    .then(function(res){
       if(res.result !== resultCodes.ok) {
         cb(res);
         return;
       }
       return TripThruApiFactory
         .createUpdateQuoteRequestFromQuoteRequest(request, this.fleets)
         .delay(3000) //wait to receive quote update from tripthru
         .then(function(res){
           quotes
             .getById(quote.id)
             .then(function(q){
               for(var i = 0; i < q.receivedQuotes.length; i++) {
                 res.quotes.push(q.receivedQuotes[i]);
               }
               res.result = resultCodes.ok;
               cb(res);
             });
         });
    })
    .error(function(err){
      var response = TripThruApiFactory.createResponseFromQuote(null, null, 
          resultCodes.unknownError, 'unknown error ocurred');
      cb(response);
    });
};

Partner.prototype.bookingsGetTripStatus = function(request, cb) {
  var t = TripThruApiFactory.createTripFromRequest(request, 'get-trip-status');
  if(!this.activeTripsByPublicId.hasOwnProperty(t.publicId)) {
    var response = TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound);
    cb(response);
    return;
  }
  
  var trip = this.activeTripsByPublicId[t.publicId];
  if(trip.service === 'local' || trip.status === 'booking') {
    var response = TripThruApiFactory.createResponseFromTrip(trip, 'get-trip-status', 
        null, null, {partner: this});
    cb(response);
  } else {
    this
      .gatewayClient
      .getTripStatus(request)
      .then(function(response){
        cb(response);
      });
  }
};

Partner.prototype.bookingsDispatchTrip = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'dispatch');
  if(request.partner.id === this.id) {
    this
      .dispatchToFirstFleetThatServes(trip)
      .then(function(t){
        if(t) {
          t.origination = 'local';
          t.service = 'local';
          cb(TripThruApiFactory.createResponseFromTrip(t, 'dispatch'));
        } else {
          cb(TripThruApiFactory.createResponseFromTrip(null, null, 
              'Dispatch unsuccessful', resultCodes.rejected));
        }
      })
      .error(function(err){
        cb(TripThruApiFactory.createResponseFromTrip(null, null, 
              'Dispatch failed', resultCodes.rejected));
      });
  } else {
    var fleet = this.fleets[0];
    var t = fleet.createTrip(trip.passenger, trip.pickupTime, trip.pickupLocation, 
        trip.dropoffLocation, trip.publicId);
    t.origination = 'local';
    t.service = 'foreign';
    if(!fleet.queueTrip(t)) {
      cb(TripThruApiFactory.createResponseFromTrip(null, null, 
          'Dispatch unsuccessful', resultCodes.rejected));
    } else {
      t.updateStatus(false, 'booking');
      this
        .tryToDispatchToForeignProvider(t, request.partner.id)
        .then(function(success){
          t.updateStatus(false, 'dispatched');
          cb(TripThruApiFactory.createResponseFromTrip(t, 'dispatch'));
        });
    }
  }
};

module.exports = Partner;