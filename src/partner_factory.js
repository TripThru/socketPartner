var simulationData = require('./models/simulation_data');
var Fleet = require('./fleet').Fleet;
var Partner = require('./partner');

function PartnerFactory() {
  
}

PartnerFactory.prototype.createPartner = function(gatewayClient, configuration) {
  var fleets = [];
  for(var i = 0; i < configuration.coverage.length; i++) {
    var coverage = configuration.coverage[i];
    var name = configuration.name + ' ' + coverage.city;
    var tripsPerHour = Math.floor(configuration.tripsPerHour*coverage.businessPercentage/100);
    var city = simulationData.getCity(coverage.city);
    var maxActiveTrips = Math.floor(tripsPerHour*0.3);
    var fleet = {
        id: name,
        name: name,
        city: coverage.city,
        baseCost: 3,
        costPerMile: 3,
        tripsPerHour: tripsPerHour > 0 ? tripsPerHour : 1,
        maxActiveTrips: maxActiveTrips > 0 ? maxActiveTrips : 1,
        coverage: { center: city, radius: 50 },
        location: city,
        vehicleTypes: ['compact', 'sedan'],
        maxDrivers: configuration.drivers,
        simulationInterval: configuration.simulationInterval
    };
    fleets.push(new Fleet(fleet));
  }
  var partner = new Partner({
    id: configuration.clientId.replace(/ /g, ''),
    name: configuration.name,
    preferedPartnerId: configuration.preferedPartnerId,
    fleets: fleets,
    gatewayClient: gatewayClient
  });
  return partner;
};

module.exports = new PartnerFactory();