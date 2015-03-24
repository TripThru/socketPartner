var cities = require('../../network_config/data/cities');
var names = require('../../network_config/data/names');
var tripsByCity = require('../../network_config/data/tripsByCity');
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

function getRandomFarmedOutTrip(networkProducts) {
  var coveredCities = {};
  for(var i = 0; i < networkProducts.length; i++) {
    if(networkProducts[i].city) {
      coveredCities[networkProducts[i].city] = 0;
    }
  }
  var randomCity = networkProducts[0].city || cityNames[Math.floor(Math.random()*cityNames.length)];
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