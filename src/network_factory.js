var simulationData = require('./models/simulation_data');
var Product = require('./product').Product;
var Network = require('./network');

function NetworkFactory() {
  
}

NetworkFactory.prototype.createNetwork = function(gatewayClient, configuration) {
  var products = [];
  if(configuration.coverage.length <= 0) {
    var maxActiveTrips = Math.floor(configuration.tripsPerHour*0.3);
    products = [new Product({
      id: configuration.name,
      name: configuration.name,
      currencyCode: configuration.currencyCode,
      capacity: configuration.capacity,
      imageUrl: configuration.imageUrl,
      acceptsPrescheduled: configuration.acceptsPrescheduled,
      acceptsOndemand: configuration.acceptsOndemand,
      acceptsCashPayment: configuration.acceptsCashPayment,
      acceptsAccountPayment: configuration.acceptsAccountPayment,
      acceptsCreditcardPayment: configuration.acceptsCreditcardPayment,
      city: null,
      baseCost: 3,
      costPerMile: 3,
      tripsPerHour: configuration.tripsPerHour,
      maxActiveTrips: maxActiveTrips > 0 ? maxActiveTrips : 1,
      coverage: null,
      location: null,
      vehicleTypes: ['compact', 'sedan'],
      maxDrivers: configuration.drivers,
      simulationInterval: configuration.simulationInterval
    })];
  }
  for(var i = 0; i < configuration.coverage.length; i++) {
    var coverage = configuration.coverage[i];
    var name = configuration.name + ' ' + coverage.city;
    var tripsPerHour = Math.floor(configuration.tripsPerHour*coverage.businessPercentage/100);
    var city = simulationData.getCity(coverage.city);
    var maxActiveTrips = Math.floor(tripsPerHour*0.3);
    var product = {
        id: name,
        name: name,
        currencyCode: configuration.currencyCode,
        capacity: configuration.capacity,
        imageUrl: configuration.imageUrl,
        acceptsPrescheduled: configuration.acceptsPrescheduled,
        acceptsOndemand: configuration.acceptsOndemand,
        acceptsCashPayment: configuration.acceptsCashPayment,
        acceptsAccountPayment: configuration.acceptsAccountPayment,
        acceptsCreditcardPayment: configuration.acceptsCreditcardPayment,
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
    products.push(new Product(product));
  }
  var network = new Network({
    id: configuration.clientId.replace(/ /g, ''),
    name: configuration.name,
    preferedNetworkId: configuration.preferedNetworkId,
    products: products,
    gatewayClient: gatewayClient
  });
  return network;
};

module.exports = new NetworkFactory();