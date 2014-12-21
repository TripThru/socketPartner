var moment = require('moment');
var codes = require('./codes');
var resultCodes = codes.resultCodes;
var PromiseHelper = require('./promise_helper');

// This module transforms incoming requests into inner structures known to the 
// whole simulation, and transforms inner structures into outgoing requests.

// To do: Create actual Trip and Quote objects instead of just same structure;

function successResponse() {
  return {
    result: codes.resultCodes.ok,
    message: 'ok'
  };
}

function failResponse(message, errorCode) {
  return {
    result: errorCode,
    message: message
  };
}

function idName(object) {
  return {
    id: object.id || null,
    name: object.name || null
  };
}

function apiLocation(location) {
  return {
    lat: location.lat,
    lng: location.lng
  };
}

function getISOStringFromMoment(moment) {
  return moment.utc().toDate().toISOString();
}

function getMomentFromISOString(dateString) {
  return moment(dateString, moment.ISO_8601, true);
}

function createDispatchRequest(trip, partner) {
  var r = {
      id: trip.publicId,
      clientId: trip.partner.id,
      passenger: idName(trip.passenger),
      pickupLocation: apiLocation(trip.pickupLocation),
      pickupTime: getISOStringFromMoment(trip.pickupTime),
      dropoffLocation: apiLocation(trip.dropoffLocation)
  };
  if(trip.vehicleType) r.vehicleType = trip.vehicleType;
  if(partner) r.partner = idName(partner);
  return r;
}

function createUpdateTripStatusRequest(trip) {
  var r = {
      id: trip.publicId,
      clientId: trip.partner.id,
      status: trip.status
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
      clientId: trip.partner.id,
  };
  return r;
}

function createTripFromDispatchRequest(request) {
  var trip = {
      publicId: request.id,
      passenger: request.passenger,
      pickupLocation: request.pickupLocation,
      pickupTime: getMomentFromISOString(request.pickupTime),
      dropoffLocation: request.dropoffLocation,
  };
  if(request.fleet) trip.fleet = request.fleet;
  if(request.driver) trip.driver = request.driver;
  if(request.vehicleType) trip.vehicleType = request.vehicleType;
  if(request.partner) trip.partner = request.partner;
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

function createDispatchResponse(trip) {
  return successResponse();
}

function createUpdateTripStatusResponse(trip) {
  return successResponse();
}

function createGetTripStatusResponse(trip, partner) {
  var r = successResponse();
  r.fleet = idName(trip.fleet);
  r.passenger = idName(trip.passenger);
  r.pickupLocation = apiLocation(trip.pickupLocation);
  r.dropoffLocation = apiLocation(trip.dropoffLocation);
  r.vehicleType = trip.vehicleType;
  r.status = trip.status;
  if(trip.dropoffTime) r.dropoffTime = getISOStringFromMoment(trip.dropoffTime);
  if(trip.pickupTime) r.pickupTime = getISOStringFromMoment(trip.pickupTime);
  if(trip.eta) r.eta = getISOStringFromMoment(trip.eta);
  if(trip.origination === 'local') {
    r.originatingPartner = idName({id: partner.id, name: partner.name});
    r.servicingPartner = idName({id: trip.partner.id, name: trip.partner.name});
  } else {
    r.originatingPartner = idName({id: trip.partner.id, name: trip.partner.name});
    r.servicingPartner = idName({id: partner.id, name: partner.name});
  }
  if(trip.origination === 'foreign') r.servicingPartner = idName({id: trip.partner.id});
  if(trip.price) r.price = trip.price;
  if(trip.driver) {
    r.driver = idName(trip.driver);
    if(trip.driver.location) r.driver.location = apiLocation(trip.driver.location);
    if(trip.driver.initialLocation) r.driver.initialLocation = apiLocation(trip.driver.initialLocation);
    if(trip.driver.route) {
      r.distance = trip.driver.route.distance;
      r.driver.routeDuration = trip.driver.route.duration.asSeconds();
    }
  }
  return r;
}

function createGetPartnerInfoResponse(fleets) {
  var response = {
      coverage: [],
      fleets: [],
      vehicleTypes: []
  };
  var vehicleTypesTemp = {};
  for(var i = 0; i < fleets.length; i++) {
    var fleet = fleets[i];
    response.fleets.push(idName(fleet));
    response.coverage.push({
        center: apiLocation(fleet.coverage.center),
        radius: fleet.coverage.radius
    });
    for(var j = 0; j < fleet.vehicleTypes.length; j++) {
      var type = fleet.vehicleTypes[j];
      if(!vehicleTypesTemp.hasOwnProperty(type)) {
        vehicleTypesTemp[type] = type;
        response.vehicleTypes.push(type);
      }
    }
  }
  return response;
}

function createRequestFromTrip(trip, type, args) {
  switch(type) {
    case 'dispatch':
      var partner;
      if(args && args.partner && args.partner.id && args.partner.name) {
        partner = args.partner;
      }
      return createDispatchRequest(trip, partner);
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
      var partner;
      if(args && args.partner && args.partner.id && args.partner.name) {
        partner = args.partner;
      } else {
        throw new Error('Partner arg is required');
      }
      return createGetTripStatusResponse(trip, partner);
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
    default:
      throw new Error('Invalid request type ' + type);
  }
}

function createResponseFromQuoteRequest(request, fleets) {
  return {
    result: resultCodes.ok
  };
}

function createTripFromQuoteRequest(request, fleet) {
  var trip = {
    id: request.id,
    pickupLocation: request.pickupLocation,
    pickupTime: request.pickupTime,
    paymentMethod: request.paymentMethod,
    passenger: request.passenger,
    dropoffLocation: request.dropoffLocation,
    vehicleType: request.vehicleType,
    maxPrice: request.maxPrice,
    minRating: request.minRating,
    fleet: fleet,
    partner: fleet.partner,
    driver: request.driver
  };
  return trip;
}

function createQuoteFromTrip(trip) {
  var quote = {
      partner: idName(trip.partner),
      fleet: idName(trip.fleet),
      vehicleType: trip.vehicleType
  };
  return trip.fleet
    .getPickupEta(trip)
    .then(function(eta){
      quote.eta = eta;
      if(trip.dropoffLocation) {
        return trip.fleet
          .getPriceAndDistance(trip)
          .then(function(priceAndDistance){
            quote.price = priceAndDistance.price;
            quote.distance = priceAndDistance.distance;
          });
      }
    })
    .then(function(){
      return quote;
    });
}

function createUpdateQuoteRequestFromQuoteRequest(request, fleets) {
  var quotes = [];
  var tasks = [];
  for(var i = 0; i < fleets.length; i++) {
    var fleet = fleets[i];
    if(!fleet.servesLocation(request.pickupLocation)) {
      continue;
    }
    for(var j = 0; j < fleet.vehicleTypes.length; j++) {
      var vehicleType = fleet.vehicleTypes[j];
      if(request.vehicleType === vehicleType) {
        var trip = createTripFromQuoteRequest(request, fleet);
        trip.vehicleType = vehicleType;
        tasks.push(trip);
      }
    }
  }
  
  // Run in sequence to avoid making too many google maps requests simultaneously
  return PromiseHelper
    .runInSequence(tasks, function(trip){
      return createQuoteFromTrip(trip)
        .then(function(quote){
          quotes.push(quote);
        });
    })
    .then(function(){
      var updateQuoteRequest = {
        id: request.id,
        quotes: quotes
      };
      return updateQuoteRequest;
    });
}

module.exports.createGetPartnerInfoResponse = createGetPartnerInfoResponse;
module.exports.createRequestFromTrip = createRequestFromTrip;
module.exports.createResponseFromTrip = createResponseFromTrip;
module.exports.createTripFromRequest = createTripFromRequest;
module.exports.createResponseFromQuoteRequest = createResponseFromQuoteRequest;
module.exports.createUpdateQuoteRequestFromQuoteRequest = createUpdateQuoteRequestFromQuoteRequest;