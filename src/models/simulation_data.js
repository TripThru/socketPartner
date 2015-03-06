var cities = require('../../partner_config/data/cities');
var names = require('../../partner_config/data/names');
var tripsByCity = require('../../partner_config/data/tripsByCity');
var cityNames = [];
for(var cityName in cities) {
  cityNames.push(cityName);
}


function getCity(name) {
  if(!cities.hasOwnProperty(name)) {
    throw new Error('Unknown city ' + name);
  }
  return cities[name];
}

function getRandomName() {
  var name = names[Math.floor(Math.random()*names.length)].split(' ');
  return name[0];
}

function getRandomFarmedOutTrip(partnerFleets) {
  if(!tripsByCity.hasOwnProperty(cityName)) {
    throw new Error('Unknown city ' + cityName);
  }
  var coveredCities = {};
  for(var i = 0; i < partnerFleets.length; i++) {
    coveredCities[partnerFleets[i].city] = 0;
  }
  var randomCity = partnerFleets[0].city;
  while(coveredCities.hasOwnProperty(randomCity)) {
    randomCity = cityNames[Math.floor(Math.random()*cityNames.length)];  
  }
  var trips = tripsByCity[randomCity];
  var trip = trips[Math.floor(Math.random()*trips.length)];
  return trip;
}

module.exports.getCity = getCity;
module.exports.getRandomName = getRandomName;
module.exports.getRandomFarmedOutTrip = getRandomFarmedOutTrip;