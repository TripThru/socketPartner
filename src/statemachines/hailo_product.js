var Product = require('../product').Product;
var logger = require('../logger');
var Promise = require('bluebird');
var PromiseHelper = require('../promise_helper');
var MapToolsError = require('../map_tools').MapToolsError;
var moment = require('moment');

function HailoProduct(config) {
  Product.call(this, config);
}

HailoProduct.prototype = Object.create(Product.prototype);

HailoProduct.prototype.makeTripEnroute = function(trip) {
  logger.log(trip.id, 'Driver is now en_route');
  return this
    .updateDriverRouteAndGetETA(trip, trip.pickupLocation)
    .then(function(eta){
      return trip.updateStatus(false, 'en_route', trip.driver.location, eta, 
          trip.driver.route.distance, trip.driver.route.duration);
    });
};

HailoProduct.prototype.makeTripPickedUp = function(trip) {
  logger.log(trip.id, 'Picking up');
  return this
    .updateDriverRouteAndGetETA(trip, trip.dropoffLocation)
    .then(function(eta){
      return trip
        .updateStatus(true, 'arrived', trip.driver.location, eta, 
          trip.driver.route.distance, trip.driver.route.duration)
        .then(function(){
          return trip.updateStatus(true, 'picked_up', trip.driver.location, eta, 
            trip.driver.route.distance, trip.driver.route.duration);
        });
    });
};

module.exports.HailoProduct = HailoProduct;