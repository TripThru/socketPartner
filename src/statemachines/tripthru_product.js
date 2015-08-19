var Product = require('../product').Product;
var logger = require('../logger');
var Promise = require('bluebird');
var PromiseHelper = require('../promise_helper');
var MapToolsError = require('../map_tools').MapToolsError;
var moment = require('moment');

function TripThruProduct(config) {
  Product.call(this, config);
}

TripThruProduct.prototype = Object.create(Product.prototype);

module.exports.TripThruProduct = TripThruProduct;