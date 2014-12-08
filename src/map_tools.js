var request = require('request');
var polyline = require('polyline');
var moment = require('moment');
var logger = require('./logger');
var store = require('./models/routes');
var Promise = require('bluebird');
var metersToMiles = 0.000621371192;
var maxDuration = 10;

function MapToolsError(error) {
  this.error = error;
  Error.captureStackTrace(this, MapToolsError);
}
MapToolsError.prototype = Object.create(Error.prototype);
MapToolsError.prototype.constructor = MapToolsError;

function Location(lat, lng) {
  this.lat = lat;
  this.lng = lng;
  this.id = this.lat + ',' + this.lng;
}

function Waypoint(location, elapse, distance) {
  Location.call(this, location.lat, location.lng);
  this.elapse = elapse;
  this.distance = distance;
}

function Route(waypoints) {
  if(waypoints.length < 2) {
    throw new MapToolsError('Route must have at least two waypoints');
  }
  
  this.start = waypoints[0];
  this.end = waypoints[waypoints.length-1];
  this.waypoints = waypoints;
  this.id = '<' + this.start.id + ':' + this.end.id + '>';
  this.duration = waypoints[waypoints.length - 1].elapse;
  this.distance = waypoints[waypoints.length - 1].distance;
}

Route.getKey = function(from, to) {
  return '<' + from.id + ':' + to.id + '>';
};
Route.prototype.getCurrentWaypoint = function(startTime, currentTime) {
  var elapse = moment.duration(currentTime.diff(startTime)).asSeconds();
  var waypoint = 0;
  while(elapse > this.waypoints[waypoint].elapse.asSeconds() && 
        waypoint < this.waypoints.length-1) {
    waypoint++;
  }
  return this.waypoints[waypoint];
};

function MapTools() {
  this.distanceAndTimeScale = 1;
  this.googleQueryLimitEnd = null;
  this.currentRequestsDay = moment().dayOfYear();
  this.requestsCountToday = 0;
}

MapTools.prototype.isInside = function(location, coverage) {
  var distance = getDistance(coverage.center, location);
  return distance < coverage.radius;
};

MapTools.prototype.locationsAreEqual = function(location1, location2, tolerance) {
  tolerance = tolerance || 0.005;
  var distance = getDistance(location1, location2);
  return distance < tolerance;
};

var getDistance = function(location1, location2) {
  var lat1 = degreesToRadians(location1.lat);
  var lng1 = degreesToRadians(location1.lng);
  var lat2 = degreesToRadians(location2.lat);
  var lng2 = degreesToRadians(location2.lng);
  var dlon = lng2 - lng1;
  var dlat = lat2 - lat1;
  var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) *
    Math.pow(Math.sin(dlon / 2), 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = 3961 * c;
  return d;
};

var degreesToRadians = function(angle) {
  return Math.PI * angle / 180;
};

MapTools.prototype.setDistanceAndTimeScale = function(scale) {
  this.distanceAndTimeScale = scale;
};

MapTools.prototype.reachedQueryLimit = function() {
  var now = moment();
  var thisDay = now.dayOfYear();
  if(this.currentRequestsDay !== thisDay) {
    this.currentRequestsDay = thisDay;
    this.requestsCountToday = 0;
  }
  return this.googleQueryLimitEnd !== null && now.isBefore(this.googleQueryLimitEnd);
};

MapTools.prototype.setMinuteOverQueryLimit = function() {
  logger.log('mp', 'Reached google OVER_QUERY_LIMIT, setting 3 second delay before resuming requests');
  this.googleQueryLimitEnd = moment().add(3, 'seconds');
};

MapTools.prototype.setDailyOverQueryLimit = function() {
  logger.log('mp', 'Reached 2500 google requests, setting 24 hours delay before resuming requests');
  this.googleQueryLimitEnd = moment().add(1, 'day').add(5, 'minutes');
};

MapTools.prototype.logNewRequest = function(wasSuccessful) {
  if(wasSuccessful) {
    this.requestsCountToday++;
    if(this.requestsCountToday >= 2499) {
      this.setDailyOverQueryLimit();
    }
  } else {
    this.setMinuteOverQueryLimit();
  }
};

MapTools.prototype.getRoute = function(from, to) {
  from = new Location(from.lat, from.lng);
  to = new Location(to.lat, to.lng);
  var self = this;
  
  return store
    .getRoute(Route.getKey(from, to))
    .then(function(route){
      if(route) {
        return Promise.resolve(routeFromStoreResult(route));
      } else {
        return makeGoogleRequest(self, from, to)
          .bind({})
          .then(function(route){
            this.route = route;
            return store.createRoute(route);
          })
          .then(function(){
            return this.route;
          });
      }
    });
};

var routeFromStoreResult = function(storeResult) {
  var waypoints = [];
  for(var i = 0; i < storeResult.waypoints.length; i++) {
    var waypoint = storeResult.waypoints[i];
    var location = new Location(waypoint.lat, waypoint.lng);
    var elapse = moment.duration(waypoint.elapse, 'seconds');
    waypoints.push(new Waypoint(location, elapse, waypoint.distance));
  }
  return new Route(waypoints);
};

var makeGoogleRequest = function(instance, from, to) {
  var self = instance;
  return new Promise(function(resolve, reject){
    var options = {
      uri: 
        'http://maps.googleapis.com/maps/api/directions/json?origin=' + from.id +
        '&destination=' + to.id + '&sensor=false&units=imperial'
    };
    request(options, function (err, res, data){
      if(err) {
        reject(new MapToolsError(err));
        return;
      }
      data = JSON.parse(data);
      if(res.statusCode !== 200 || 
          data.status === 'ZERO_RESULTS' || 
          data.status === 'OVER_QUERY_LIMIT') {
        self.logNewRequest(false);
        reject(new MapToolsError('Reached google query limit'));
        return;
      }
      self.logNewRequest(true);
      
      var waypoints = [];
      waypoints.push(new Waypoint(from, moment.duration(0, 'seconds'), 0));
      var totalDistance = 0;
      var elapse = 0;
      for(var i = 0; i < data.routes[0].legs.length; i++) {
        var leg = data.routes[0].legs[i];
        for(var j = 0; j < leg.steps.length; j++) {
          var step = leg.steps[j];
          var duration = step.duration.value;
          var distance = step.distance.value * metersToMiles;
          var end = step.end_location;
          var tempTotalDistance = totalDistance;
          totalDistance += distance;
          var tempElapse = elapse;
          elapse += duration;
          
          if(duration > maxDuration) {
            var locations = decodePolylinePoints(step.polyline.points);
            var granulatedWaypoints = 
              increaseWaypointLocations(locations, duration, tempElapse, 
                  distance, tempTotalDistance);
              Array.prototype.push.apply(waypoints, granulatedWaypoints);
          } else {
            waypoints.push(new Waypoint(end, moment.duration(elapse, 'seconds'),
                totalDistance)
            );
          }
        }
      }
      waypoints.push(new Waypoint(to, moment.duration(elapse, 'seconds'), 
          totalDistance)
      );
      var route = new Route(waypoints);
      resolve(route);
    });
  });
};

var increaseWaypointLocations = function(locations, duration, totalDuration, 
    distance, totalDistance) {
  
  var maxStepLatLng = 0.0005;
  var waypoints = [];
  var countDuration = totalDuration;
  var countDistance = totalDistance;
  var stepDuration = duration / locations.length;
  var stepDistance = distance / locations.length;
  var tempLocation = null;
  
  for(var i = 0; i < locations.length; i++) {
    var location = locations[i];
    if(!tempLocation) {
      tempLocation = location;
      countDuration = stepDuration;
      countDistance = stepDistance;
      continue;
    }
    var tempLocations = 
      increaseGranularityDistance(tempLocation, location, maxStepLatLng);
    var stepDurationTemp = stepDuration / tempLocations.length;
    var stepDistanceTemp = stepDistance / tempLocations.length;
    var countDurationTemp = countDuration;
    var countDistanceTemp = countDistance;
    for(var j = 0; j < tempLocations.length; j++) {
      var tempLoc = tempLocations[j];
      countDurationTemp += stepDurationTemp;
      countDistanceTemp += stepDistanceTemp;
      waypoints.push(
          new Waypoint(tempLoc, moment.duration(countDurationTemp , 'seconds'), 
              countDistanceTemp)
          );
    }
    countDuration += stepDuration;
    countDistance += stepDistance;
    tempLocation = location;
  }
  return waypoints;
};

var increaseGranularityDistance = function(from, to, maxLatLng) {
  var locations = [];
  var lat = from.lat - to.lat;
  var lng = from.lng - to.lng;
  var latCount = from.lat;
  var lngCount = from.lng;
  var result = Math.sqrt(Math.pow(lat, 2) + Math.pow(lng, 2));
  if(result > maxLatLng) {
    var repeatTimes = Math.floor(result / maxLatLng);
    var stepLat = lat / repeatTimes;
    var stepLng = lng / repeatTimes;
    for(var i = 1; i < repeatTimes; i++) {
      latCount -= stepLat;
      lngCount -= stepLng;
      locations.push(new Location(latCount, lngCount));
    }
  }
  locations.push(new Location(to.lat, to.lng));
  return locations;
};

var decodePolylinePoints = function(encodedPoints) {
  var points = polyline.decode(encodedPoints);
  var locations = [];
  for(var i = 0; i < points.length; i++) {
    locations.push(new Location(points[i][0], points[i][1]));
  }
  return locations;
};

module.exports.MapTools = new MapTools();
module.exports.MapToolsError = MapToolsError;
module.exports.Location = Location;