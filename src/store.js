var config = require('../config');
var schemas = require('./schemas/store');
var mongoose = require("mongoose");
var logger = require('./logger');
Promise = require('bluebird');

mongoose.connect(config.db.url, function (err, res) {
  if (err) {
    logger.log ('init', 'Error connecting to: ' + config.db.url + '. ' + err);
  } else {
    logger.log('init', 'Successfully connected to: ' + config.db.url);
  }
});

var Trip = mongoose.model('trips', schemas.trip);
Promise.promisifyAll(Trip);
Promise.promisifyAll(Trip.prototype);

var Route = mongoose.model('routes', schemas.route);
Promise.promisifyAll(Route);
Promise.promisifyAll(Route.prototype);

function create(model, data) {
  return model.createAsync(data);
}

function update(model, data) {
  return model.updateAsync({id: data.id}, data);
}

function get(model, query) {
  return model.findAsync(query);
}

function Store(){

}

Store.prototype.createTrip = function(trip) {
  return create(Trip, trip);
};

Store.prototype.updateTrip = function(trip) {
  return update(Trip, trip);
};

Store.prototype.getTrip = function(trip) {
  return get(Trip, trip);
};

Store.prototype.createRoute = function(route) {
  return create(Route, route);
};

Store.prototype.updateRoute = function(route) {
  return update(Route, route);
};

Store.prototype.getRoute = function(route) {
  return get(Route, route);
};

Store.prototype.clear = function() {
  mongoose.connection.db.dropCollection('trips');
};

module.exports = new Store();