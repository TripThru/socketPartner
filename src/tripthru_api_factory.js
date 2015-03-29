var moment = require('moment');
var codes = require('./codes');
var logger = require('./logger');
var resultCodes = codes.resultCodes;
var PromiseHelper = require('./promise_helper');
var maptools = require('./map_tools').MapTools;
var MapToolsError = require('./map_tools').MapToolsError;

// This module transforms incoming requests into inner structures known to the 
// whole simulation, and transforms inner structures into outgoing requests.

// To do: Create actual Trip and Quote objects instead of just same structure;

function successResponse() {
  return {
    result_code: codes.resultCodes.ok,
    result: 'OK'
  };
}

function failResponse(message, errorCode) {
  return {
    result_code: errorCode,
    result: message
  };
}

function idName(object) {
  var o = {};
  if(object.id) o.id = object.id;
  if(object.name) o.name = object.name;
  return o;
}

function apiLocation(location) {
  var loc = {
    lat: location.lat,
    lng: location.lng
  };
  if(location.description) loc.description = location.description;
  return loc;
}

function getISOStringFromMoment(moment) {
  return moment.utc().format().toString();
}

function getMomentFromISOString(dateString) {
  return moment.utc(dateString, moment.ISO_8601, true);
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function createDispatchRequest(trip, network) {
  var r = {
      id: trip.publicId,
      client_id: trip.network.id,
      customer: idName(trip.customer),
      pickup_location: apiLocation(trip.pickupLocation),
      pickup_time: getISOStringFromMoment(trip.pickupTime),
      dropoff_location: apiLocation(trip.dropoffLocation),
      passengers: 1,
      luggage: 0,
      payment_method_code: 'cash'
  };
  if(network) r.network_id = network.id;
  return r;
}

function createUpdateTripStatusRequest(trip) {
  var r = {
    id: trip.publicId,
    client_id: trip.network.id,
    status: trip.status,
    product: {
      id: trip.product.id,
      name: trip.product.name,
      image_url: trip.product.imageUrl
    }
  };
  if(trip.eta) r.eta = getISOStringFromMoment(trip.eta);
  if(trip.driver) {
    r.driver = idName(trip.driver);
    if(trip.driver.location) r.driver.location = apiLocation(trip.driver.location);
  }
  return r;
}

function createGetTripStatusRequest(trip) {
  var r = {
    id: trip.publicId,
    client_id: trip.network.id,
  };
  return r;
}

function createTripFromDispatchRequest(request) {
  var trip = {
    publicId: request.id,
    customer: request.customer,
    pickupLocation: request.pickup_location,
    pickupTime: getMomentFromISOString(request.pickup_time),
    dropoffLocation: request.dropoff_location,
  };
  if(request.product_id) trip.product = idName({ id: request.product_id });
  if(request.network_id) trip.network = idName({ id: request.network_id });
  return trip;
}

function createTripFromUpdateTripStatusRequest(request) {
  var trip = {
    publicId: request.id,
    status: request.status
  };
  if(request.driver) {
    trip.driver = idName(request.driver);
    if(request.driver.location) {
      trip.driver.location = request.driver.location;
    }
  }
  if(request.eta) trip.eta = getMomentFromISOString(request.eta)
  return trip;
}

function createTripFromGetTripStatusRequest(request) {
  var trip = {
    publicId: request.id  
  };
  return trip;
}

function createTripFromGetTripRequest(request) {
  var trip = {
    publicId: request.id  
  };
  return trip;
}

function createDispatchResponse(trip) {
  return successResponse();
}

function createUpdateTripStatusResponse(trip) {
  return successResponse();
}

function createGetTripStatusResponse(trip, network) {
  var r = successResponse();
  r.product = idName(trip.product);
  r.product.image_url = trip.product.imageUrl;
  r.customer = idName(trip.customer);
  r.status = trip.status;
  if(trip.eta) r.eta = getISOStringFromMoment(trip.eta);
  if(trip.driver) {
    r.driver = idName(trip.driver);
    if(trip.driver.location) r.driver.location = apiLocation(trip.driver.location);
  }
  return r;
}

function createGetTripResponse(trip) {
  var r = successResponse();
  r.distance = trip.distance;
  r.fare = trip.fare;
  return r;
}

function createGetNetworkInfoResponse(products) {
  var response = {
    id: products[0].network.id,
    name: products[0].network.name,
    products: []
  };
  for(var i = 0; i < products.length; i++) {
    var product = products[i];
    var p = {
      id: product.id,
      name: product.name,
      image_url: product.imageUrl,
      capacity: product.capacity,
      accepts_prescheduled: product.acceptsPrescheduled,
      accepts_ondemand: product.acceptsOndemand,
      accepts_cash_payment: product.acceptsCashPayment,
      accepts_account_payment: product.acceptsAccountPayment,
      accepts_creditcard_payment: product.acceptsCreditcardPayment
    };
    if(product.coverage) { 
      p.coverage = product.coverage;
    }
    response.products.push(p);
  }
  return response;
}

function createRequestFromTrip(trip, type, args) {
  switch(type) {
    case 'dispatch':
      var network;
      if(args && args.network && args.network.id && args.network.name) {
        network = args.network;
      }
      return createDispatchRequest(trip, network);
    case 'update-trip-status':
      return createUpdateTripStatusRequest(trip);
    case 'get-trip-status':
      return createGetTripStatusRequest(trip);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createResponseFromTrip(trip, type, message, errorCode, args) {
  if(errorCode) {
    return failResponse(message, errorCode);
  }
  switch(type) {
    case 'dispatch':
      return createDispatchResponse(trip);
    case 'update-trip-status':
      return createUpdateTripStatusResponse(trip);
    case 'get-trip-status':
      var network;
      if(args && args.network && args.network.id && args.network.name) {
        network = args.network;
      } else {
        throw new Error('Network arg is required');
      }
      return createGetTripStatusResponse(trip, network);
    case 'get-trip':
      return createGetTripResponse(trip);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createTripFromRequest(trip, type) {
  switch(type) {
    case 'dispatch':
      return createTripFromDispatchRequest(trip);
    case 'update-trip-status':
      return createTripFromUpdateTripStatusRequest(trip);
    case 'get-trip-status':
      return createTripFromGetTripStatusRequest(trip);
    case 'get-trip':
      return createTripFromGetTripRequest(trip);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createResponseFromQuoteRequest(request, products) {
  return {
    result: resultCodes.ok
  };
}

function createTripFromQuoteRequest(request, product) {
  var trip = {
    id: request.id,
    product: product,
    pickupLocation: request.pickup_location,
    pickupTime:  getMomentFromISOString(request.pickup_time),
    paymentMethod: request.payment_method_code,
    dropoffLocation: request.dropoff_location
  };
  if(request.customer_id) {
    trip.customer = { id: request.customer_id };
  }
  return trip;
}

function createPaymentRequestFromTrip(trip) {
  return {
    id: trip.publicId,
    currency_code: trip.product.currencyCode,
    fare: trip.fare
  };
}

function createAcceptPaymentRequestFromTrip(trip) {
  return {
    id: trip.publicId,
    tip: 1,
    confirmation: true
  };
}

function createPaymentRequestResponseFromPaymentRequest(request) {
  return successResponse();
}

function createAcceptPaymentResponseFromAcceptPaymentRequest(request) {
  return successResponse();
}

function createTripFromRequestPaymentRequest(request) {
  return {
    publicId: request.id,
    fare: request.fare
  };
}

function createTripFromAcceptPaymentRequest(request) {
  return {
    publicId: request.id
  };
}

function createTripPaymentRequestFromTrip(trip, type) {
  switch(type) {
    case 'request-payment':
      return createPaymentRequestFromTrip(trip);
    case 'accept-payment':
      return createAcceptPaymentRequestFromTrip(trip);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createResponseFromTripPaymentRequest(request, type) {
  switch(type) {
    case 'request-payment':
      return createPaymentRequestResponseFromPaymentRequest(request);
    case 'accept-payment':
      return createAcceptPaymentResponseFromAcceptPaymentRequest(request);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createTripFromTripPaymentRequest(request, type) {
  switch(type) {
    case 'request-payment':
      return createTripFromRequestPaymentRequest(request);
    case 'accept-payment':
      return createTripFromAcceptPaymentRequest(request);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createQuoteFromTrip(trip) {
  var quote = {
    id: guid()
  };
  return trip
    .product
    .getPickupEta(trip.product.location, trip.pickupLocation, trip.pickupTime, true)
    .then(function(eta){
      quote.eta = eta;
      quote.network = {
        id: trip.product.network.id,
        name: trip.product.network.name
      };
      quote.product = {
        id: trip.product.id,
        name: trip.product.name,
        image_url: trip.product.imageUrl
      };
      if(trip.dropoffLocation) {
        return trip.product
          .getFareAndDistance(trip)
          .then(function(fareAndDistance){
            quote.fare = {
              low_estimate: 5,
              high_estimate: 15,
              currency_code: trip.product.currencyCode
            };
            quote.distance = fareAndDistance.distance;
            quote.duration = 300;
          })
          .catch(MapToolsError, function(err){
            logger.log(trip.id, 'MapToolsError: ' + err.message);
          });
      }
    })
    .then(function(){
      return quote;
    })
    .catch(MapToolsError, function(err){
      logger.log(trip.id, 'MapToolsError: ' + err.message);
    })
    .finally(function(){
      return null;
    });
}

function createResponseFromGetQuoteRequest(request, products) {
  var quotes = [];
  var tasks = [];
  for(var i = 0; i < products.length; i++) {
    var product = products[i];
    if(!product.servesLocation(request.pickup_location)) {
      continue;
    }
    var trip = createTripFromQuoteRequest(request, product);
    tasks.push(trip);
  }
  
  // Run in sequence to avoid making too many google maps requests simultaneously
  return PromiseHelper
    .runInSequence(tasks, function(trip){
      return createQuoteFromTrip(trip)
        .then(function(quote){
          if(quote) {
            quote.eta = getISOStringFromMoment(quote.eta);
            quotes.push(quote);
          }
        });
    })
    .then(function(){
      var response = successResponse();
      response.id = request.id;
      response.quotes = quotes;
      return response;
    });
}

function createQuoteFromGetQuoteRequest(request) {
  var quote = {
    id: request.id,
    clientId: request.client_id,
    request: request,
    receivedQuotes: []
  };
  return quote;
}

function createQuoteFromGetQuoteRequest(request) {
  var r = {
      id: request.id
  };
  return r;
}

function createQuoteResponseFromQuote(request) {
  return successResponse();
}

function createUpdateQuoteResponseFromQuote(quote) {
  return successResponse();
}

function createQuoteRequestFromQuote(quote) {
  throw new Error('Not implemented');
}

function createUpdateQuoteRequestFromQuote(quote) {
  return createGetQuoteRequestFromQuote(quote);
}

function createGetQuoteRequestFromQuote(quote) {
  throw new Error('Not implemented');
}

function createRequestFromQuote(quote, type, args) {
  switch(type) {
    case 'quote':
      return createQuoteRequestFromQuote(quote);
    case 'update':
      return createUpdateQuoteRequestFromQuote(quote);
    case 'get':
      return createGetQuoteRequestFromQuote(quote);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createResponseFromQuote(quote, type, message, errorCode) {
  if(errorCode) {
    return failResponse(message, errorCode);
  }
  switch(type) {
    case 'quote':
      return createQuoteResponseFromQuote(quote);
    case 'update':
      return createUpdateQuoteResponseFromQuote(quote);
    case 'get':
      return createGetQuoteResponseFromQuote(quote);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createQuoteFromRequest(quote, type, args) {
  switch(type) {
    case 'quote':
      return createQuoteFromQuoteRequest(quote);
    case 'update':
      if(!args || !args.quote) {
        throw new Error('Need quote object to update');
      }
      return createQuoteFromUpdateQuoteRequest(quote, args.quote);
    case 'get':
      return createQuoteFromGetQuoteRequest(quote);
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createDriversNearbyResponse(request, products) {
  return new Promise(function(resolve, reject){
    var coverage = {
      center: {
        lat: request.location.lat,
        lng: request.location.lng
      },
      radius: request.radius || 0.1
    };
    var limit = request.limit || 10;
    var productId = request.product_id || null;
    var drivers = [];
    for(var i = 0; i < products.length && drivers.length < limit; i++) {
      var product = products[i];
      if((!productId || productId === product.id) && product.servesLocation(request.location)) {
        if(maptools.isInside(product.location, coverage)) {
          var driver = product.createDriver();
          if(driver) {
            drivers.push(driver);
            product.deleteDriver(driver);
          }
        }
        for(var j = 0; j < product.returningDrivers.length && drivers.length < limit; j++) {
          var driver = product.returningDrivers[j];
          if(driver.location && maptools.isInside(driver.location, coverage)) {
            drivers.push(driver);
          }
        }
      }
    }
    var response = {
      drivers: []
    };
    PromiseHelper
      .runInSequence(drivers, function(driver){
        return driver
          .product
          .getPickupEta(driver.location, request.location, moment(), false)
          .then(function(pickupEta){
            response.drivers.push({
              lat: driver.location.lat,
              lng: driver.location.lng,
              eta: getISOStringFromMoment(pickupEta),
              product: {
                id: driver.product.id,
                name: driver.product.name,
                image_url: driver.product.image_url
              }
            });
          });
      })
      .then(function(){
        var r = successResponse();
        r.count = response.drivers.length;
        r.drivers = response.drivers;
        resolve(r);
      });
  });
}

module.exports.createGetNetworkInfoResponse = createGetNetworkInfoResponse;
module.exports.createRequestFromTrip = createRequestFromTrip;
module.exports.createResponseFromTrip = createResponseFromTrip;
module.exports.createTripFromRequest = createTripFromRequest;
module.exports.createResponseFromQuoteRequest = createResponseFromQuoteRequest;
module.exports.createRequestFromQuote = createRequestFromQuote;
module.exports.createResponseFromQuote = createResponseFromQuote;
module.exports.createQuoteFromRequest = createQuoteFromRequest;
module.exports.createResponseFromGetQuoteRequest = createResponseFromGetQuoteRequest;
module.exports.createTripPaymentRequestFromTrip = createTripPaymentRequestFromTrip;
module.exports.createResponseFromTripPaymentRequest = createResponseFromTripPaymentRequest;
module.exports.createTripFromTripPaymentRequest = createTripFromTripPaymentRequest;
module.exports.createDriversNearbyResponse = createDriversNearbyResponse;