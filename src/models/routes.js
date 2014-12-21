var store = require('../store');
var moment = require('moment');

function durationsToNumbers(route) {
  var r = {
      id: route.id,
      waypoints: []
  };
  for(var i = 0; i < route.waypoints.length; i++) {
    var waypoint = route.waypoints[i];
    r.waypoints.push({
      elapse: waypoint.elapse.asSeconds(),
      distance: waypoint.distance,
      lat: waypoint.lat,
      lng: waypoint.lng
    });
  }
  return r;
}

function RouteModel() {
  
}

RouteModel.prototype.createRoute = function(route) {
  return store.createRoute(durationsToNumbers(route));
};

RouteModel.prototype.updateRoute = function(route) {
  return store.updateRoute(route);
};

RouteModel.prototype.getRouteById = function(routeId) {
  return store
    .getRoute({id: routeId})
    .then(function(result){
      return result.length > 0 ? result[0].toObject() : null;
    });
};

module.exports = new RouteModel();