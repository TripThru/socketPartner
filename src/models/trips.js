var store = require('../store');
var moment = require('moment');

function momentsToDates(trip) {
  var t = {};
  t.id = trip.id;
  t.publicId = trip.publicId;
  t.idNumber = trip.idNumber;
  t.product = trip.product;
  t.network = trip.product.network;
  t.status = t.status;
  t.driver = trip.driver;
  t.passenger = trip.passenger;
  t.origination = trip.origination;
  t.service = t.service;
  t.luggage = trip.luggage;
  t.persons = trip.persons;
  t.pickupLocation = trip.pickupLocation;
  t.dropoffLocation = trip.dropoffLocation;
  t.paymentMethod = trip.paymentMethod;
  t.vehicleType = trip.vehicleType;
  t.price = trip.price;
  t.maxPrice = trip.maxPrice;
  t.minRating = trip.minRating;
  t.autoDispatch = trip.autoDispatch;
  t.lastStatusNotifiedToNetwork = trip.lastStatusNotifiedToNetwork;
  if(trip.pickupTime) t.pickupTime = trip.pickupTime.toDate();
  if(trip.dropoffTime) t.dropoffTime = trip.dropoffTime.toDate();
  if(trip.eta) t.eta = trip.eta.toDate();
  if(trip.creation) t.creation = trip.creation.toDate();
  if(trip.lastUpdate) t.lastUpdate = trip.lastUpdate.toDate();
  return t;
}

function datesToMoments(trip) {
  if(trip.pickupTime) trip.pickupTime = moment(trip.pickupTime);
  if(trip.dropoffTime) trip.dropoffTime = moment(trip.dropoffTime);
  if(trip.eta) trip.eta = moment(trip.eta);
  if(trip.creation) trip.creation = moment(trip.creation);
  if(trip.lastUpdate) trip.lastUpdate = moment(trip.lastUpdate);
  return trip;
}

function TripModel() {
  
}

TripModel.prototype.createTrip = function(trip) {
  return store.createTrip(momentsToDates(trip));
};

TripModel.prototype.updateTrip = function(trip) {
  return store.updateTrip(trip);
};

TripModel.prototype.getTrip = function(trip) {
  return store
    .getTrip(trip)
    .then(function(result){
      return result.length > 0 ? datesToMoments(result[0].toObject()) : null;
    });
};

module.exports = new TripModel();