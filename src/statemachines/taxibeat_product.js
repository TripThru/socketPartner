var Product = require('../product').Product;
var logger = require('../logger');
var Promise = require('bluebird');
var PromiseHelper = require('../promise_helper');
var MapToolsError = require('../map_tools').MapToolsError;
var moment = require('moment');

function TaxibeatProduct(config) {
  Product.call(this, config);
}

TaxibeatProduct.prototype = Object.create(Product.prototype);

TaxibeatProduct.prototype.makeTripPickedUp = function(trip) {
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

module.exports.TaxibeatProduct = TaxibeatProduct;