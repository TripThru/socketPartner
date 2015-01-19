/*
 * This will only generate the route from pickup to dropoff, the simulations will
 * use more combinations because drivers first need to travel from home office 
 * to pickup location
 */

var maptools = require('../src/map_tools').MapTools;
var tripsByCity = require('../partner_config/data/tripsByCity');

var tripsList = [];
for(var city in tripsByCity) {
  var trips = tripsByCity[city];
  for(var i = 0; i < trips.length; i++) {
    tripsList.push(trips[i]);
  }
}

// Use an interval to request routes since Google limits the amount of requests
// per second
var i = 0;
setInterval(function(){
  if(i++ < tripsList.length) {
    var trip = tripsList[i];
    maptools
      .getRoute(trip.start, trip.end)
      .then(function(route){
        console.log('Generated ' + route.id);
      })
      .error(function(err){
        console.log('Error generating <' + trip.start.lat + ',' + trip.start.lng +
            ':' + trip.end.lat + ',' + trip.end.lng + '> : ' + err);
      });
  }
}, 1000);