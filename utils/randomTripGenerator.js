var fs = require('fs');
  
function getLocation(x0, y0, radius) {
    // Convert radius from meters to degrees
    var radiusInDegrees = radius / 111000;

    var u = Math.random();
    var v = Math.random();
    var w = radiusInDegrees * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    // Adjust the x-coordinate for the shrinking of the east-west distances
    var new_x = x / Math.cos(y0);

    var foundLatitude = new_x + x0;
    var foundLongitude = y + y0;
    return { lat: foundLatitude, lng: foundLongitude };
}

function generateRandomLocations() {
  var cities = require('../network_config/data/cities');
  var tripsByCity = {};
  var radiusInMeters = 2000;
  
  for(var city in cities) {
    var cityTrips = [];
    console.log(city);
    for(var i = 0; i < 10; i++) {
      var trip = {}; 
      trip.start = getLocation(cities[city].lat, cities[city].lng, radiusInMeters);
      trip.end = getLocation(cities[city].lat, cities[city].lng, radiusInMeters);
      console.log(trip.start.lat + ', ' + trip.start.lng);
      console.log(trip.end.lat + ', ' + trip.end.lng);
      cityTrips.push(trip);
    }
    tripsByCity[city] = cityTrips;
  }
  return tripsByCity;
}

function generateTripsFromLocations() {
  var cities = require('../network_config/data/cities');
  var locationsByCity = require('./locationsByCity');
  var tripsByCity = {};
  for(var city in cities) {
    var cityTrips = [];
    var trips = locationsByCity[city];
    console.log(city);
    for(var i = 0; i < 10; i++) {
      var trip = {}; 
      var location = trips[Math.floor(Math.random()*trips.length)].split(', ');
      trip.start = {lat: location[0], lng: location[1]};
      trip.end = trip.start;
      while(trip.start.lat === trip.end.lat && trip.start.lng === trip.end.lng) {
        location = trips[Math.floor(Math.random()*trips.length)].split(', ');
        trip.end = {lat: location[0], lng: location[1]};
      }
      cityTrips.push(trip);
    }
    tripsByCity[city] = cityTrips;
  }
  return tripsByCity;
}

var data = generateTripsFromLocations();
data = JSON.stringify(data, undefined, 2);
fs.writeFile('./tripsByCity.js', data);


