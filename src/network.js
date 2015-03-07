var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var IProduct = require('./product').IProduct;
var Product = require('./product').Product;
var logger = require('./logger');
var trips = require('./models/trips');
var quotes = require('./models/quotes');
var TripThruApiFactory = require('./tripthru_api_factory');
var codes = require('./codes');
var Promise = require('bluebird');
var PromiseHelper = require('./promise_helper');
var resultCodes = codes.resultCodes;
var moment = require('moment');

function Network(config) {
  
  if(!config.id) {
    throw new Error('Id is required');
  }
  if(!config.name) {
    throw new Error('Name is required');
  }
  if(!config.gatewayClient) {
    throw new Error('GatewayClient instance is required');
  }
  if(!config.products || config.products.length === 0) {
    throw new Error('At least one product is required');
  }
  
  Gateway.call(this, config.id, config.name);
  Interface.ensureImplements(config.gatewayClient, IGateway);
  for(var i = 0; i < config.products.length; i++) {
    Interface.ensureImplements(config.products[i], IProduct);
  }
  
  this.gatewayClient = config.gatewayClient;
  this.products = config.products;
  this.productsById = {};
  for(var j = 0; j < config.products.length; j++) {
    var product = config.products[j];
    this.productsById[product.id] = product;
    product.setNetwork(this);
  }
  this.preferedNetworkId = config.preferedNetworkId;
  this.activeTripsByPublicId = {};
  this.tripRemovalDuration = moment.duration(3, 'minute');
}

Network.prototype.getNetworkInfo = function(request, cb) {
  cb(TripThruApiFactory.createGetNetworkInfoResponse(this.products));
};

Network.prototype.setNetworkInfoAtTripThru = function(cb) {
  var request = TripThruApiFactory.createGetNetworkInfoResponse(this.products);
  this
    .gatewayClient
    .setNetworkInfo(request)
    .then(function(res){
      cb(res);
    });
};

Network.prototype.dispatchTrip = function(request, cb) {
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
  } else if(trip.product && trip.product.id) {
    dispatchPromise = this.dispatchToSpecificProduct(trip);
  } else {
    dispatchPromise = this.dispatchToFirstProductThatServes(trip);
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

Network.prototype.dispatchToSpecificDriver = function(trip) {
  logger.log(trip.publicId, 'Dispatching to specific driver ' + trip.driver.id);
  throw new Error('Not implemented');
};

Network.prototype.dispatchToSpecificProduct = function(trip) {
  logger.log(trip.publicId, 'Dispatching to product ' + trip.product.id);
  var product = this.productsById[trip.product.id];
  
  if(product && product.servesLocation(trip.pickupLocation)) {
    var t = product.createTrip(trip.customer, trip.pickupTime, trip.pickupLocation, 
          trip.dropoffLocation, trip.publicId);
    if(product.queueTrip(t)) {
      return Promise.resolve(t);
    }
  }
  return Promise.resolve(null);
};

Network.prototype.dispatchToFirstProductThatServes = function(trip) {
  logger.log(trip.publicId, 'Dispatching to first product that serves');
  for(var i = 0; i < this.products.length; i++) {
    var product = this.products[i];
    if(product.servesLocation(trip.pickupLocation)) {
      trip.product = { id: product.id, name: product.name };
      break;
    }
  }
  if(trip.product) {
    return this.dispatchToSpecificProduct(trip);
  }
  Promise.resolve(null);
};

Network.prototype.getTripStatus = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'get-trip-status');
  var response;
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    response = TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound);
  } else {
    var t = this.activeTripsByPublicId[trip.publicId];
    response = TripThruApiFactory.createResponseFromTrip(t, 'get-trip-status', 
        null, null, {network: this});
    logger.log(t.id, this.id + ' received get status request');
  }
  cb(response);
};

Network.prototype.updateTripStatus = function(request, cb) {
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

Network.prototype.getTrip = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'get-trip');
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound));
    return;
  }
  var t = this.activeTripsByPublicId[trip.publicId];
  cb(TripThruApiFactory.createResponseFromTrip(t, 'get-trip'));
};

Network.prototype.getDriversNearby = function(request, cb) {
  throw new Error('Not implemented');
};

Network.prototype.requestPayment = function(request, cb) {
  logger.log(request.id, this.id + ' received payment request');
  
  var trip = 
    TripThruApiFactory.createTripFromTripPaymentRequest(request, 'request-payment');
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound));
    return;
  }
  var response = 
    TripThruApiFactory.createResponseFromTripPaymentRequest(request, 'request-payment');
  cb(response);
  
  setTimeout(function(){
    logger.log(request.id, this.id + ' accepting payment request');
    var acceptPaymentRequest = 
      TripThruApiFactory.createTripPaymentRequestFromTrip(trip, 'accept-payment');
    this.gatewayClient.acceptPayment(acceptPaymentRequest);
  }.bind(this), 1000);
};

Network.prototype.acceptPayment = function(request, cb) {
  logger.log(request.id, this.id + ' received accept payment request');
  
  var trip = 
    TripThruApiFactory.createTripFromTripPaymentRequest(request, 'accept-payment');
  if(!this.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    cb(TripThruApiFactory.createResponseFromTrip(null, null, 
        'Not found', resultCodes.notFound));
    return;
  }
  var response = 
    TripThruApiFactory.createResponseFromTripPaymentRequest(request, 'accept-payment');
  cb(response);
};

Network.prototype.getQuote = function(request, cb) {
  logger.log(request.id, this.id + ' received getQuote');
  TripThruApiFactory
    .createResponseFromGetQuoteRequest(request, this.products)
    .then(function(updateQuoteRequest){
      cb(updateQuoteRequest);
    });
};

Network.prototype.update = function() {
  return PromiseHelper.runInSequence(this.products, function(product){
    return product.simulate();
  });
};

Network.prototype.sendPaymentRequestToTripThru = function(trip) {
  var paymentRequest = 
    TripThruApiFactory.createTripPaymentRequestFromTrip(trip, 'request-payment');
  this.gatewayClient.requestPayment(paymentRequest);
};

Network.prototype.tryToCreateLocalTripAtTripThru = function(trip) {
  logger.log(trip.id, 'Creating local trip in TripThru');
  return this.tryToDispatchToForeignProvider(trip, this.id);
};

Network.prototype.tryToDispatchToForeignProvider = function(trip, networkId) {
  var network = networkId ? {network: {id: networkId, name: networkId}} : null;
  var request = 
    TripThruApiFactory.createRequestFromTrip(trip, 'dispatch', network);
  return this
    .gatewayClient
    .dispatchTrip(request)
    .bind(this)
    .then(function(response){
      var success = response.result_code === resultCodes.ok;
      if(success) {
        if(networkId === this.id) {
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

Network.prototype.addTrip = function(trip) {
  this.activeTripsByPublicId[trip.publicId] = trip;
  //trips.createTrip(trip);
};

Network.prototype.deactivateTrip = function(trip, status) {
  //trips.updateTrip(trip);
  var self = this;
  setTimeout(function(){
    delete self.activeTripsByPublicId[trip.publicId];
  }, this.tripRemovalDuration.asMilliseconds());
};

Network.prototype.updateForeignNetwork = function(trip) {
  var request = TripThruApiFactory.createRequestFromTrip(trip, 'update-trip-status');
  return this.gatewayClient.updateTripStatus(request);
};

//This are helper function used only by the bookings website, to simulate a sync
//quoting process simplifying the bookings website adaptation to the Node api

Network.prototype.bookingsQuoteTrip = function(request, cb) {
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
      cb(res);
    })
    .error(function(err){
      var response = TripThruApiFactory.createResponseFromQuote(null, null, 
          resultCodes.unknownError, 'unknown error ocurred');
      cb(response);
    });
};

Network.prototype.bookingsGetTripStatus = function(request, cb) {
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
        null, null, {network: this});
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

Network.prototype.bookingsDispatchTrip = function(request, cb) {
  var trip = TripThruApiFactory.createTripFromRequest(request, 'dispatch');
  if(request.network.id === this.id) {
    this
      .dispatchToFirstProductThatServes(trip)
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
    var product = this.products[0];
    var t = product.createTrip(trip.customer, trip.pickupTime, trip.pickupLocation, 
        trip.dropoffLocation, trip.publicId);
    t.origination = 'local';
    t.service = 'foreign';
    if(!product.queueTrip(t)) {
      cb(TripThruApiFactory.createResponseFromTrip(null, null, 
          'Dispatch unsuccessful', resultCodes.rejected));
    } else {
      t.updateStatus(false, 'booking');
      this
        .tryToDispatchToForeignProvider(t, request.network.id)
        .then(function(success){
          t.updateStatus(false, 'dispatched');
          cb(TripThruApiFactory.createResponseFromTrip(t, 'dispatch'));
        });
    }
  }
};

module.exports = Network;