var simulationData = require('./models/simulation_data');
var globalConfiguration = require('../config');
var TripThruProduct = require('./statemachines/tripthru_product').TripThruProduct;
var CabifyProduct = require('./statemachines/cabify_product').CabifyProduct;
var HailoProduct = require('./statemachines/hailo_product').HailoProduct;
var TaxibeatProduct = require('./statemachines/taxibeat_product').TaxibeatProduct;
var Network = require('./network');

function createProduct(config, simulationType) {
  switch(simulationType) {
    case 'cabify':
      return new CabifyProduct(config);
      break;
    case 'hailo':
      return new HailoProduct(config);
      break;
    case 'taxibeat':
      return new TaxibeatProduct(config);
      break;
    default:
      return new TripThruProduct(config);
  } 
}

function NetworkFactory() {
  
}

NetworkFactory.prototype.createNetwork = function(gatewayClient, configuration) {
  var products = [];
  if(configuration.coverage.length <= 0) {
    var maxActiveTrips = Math.floor(configuration.tripsPerHour*0.3);
    var productConfig = {
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
    };
    products.push(createProduct(productConfig, configuration.simulationType));
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
    products.push(createProduct(product, configuration.simulationType));
  }
  if(!endsWith(globalConfiguration.expressUrl, '/')) {
    globalConfiguration.expressUrl += '/';
  }
  var callbackUrl = globalConfiguration.expressUrl + configuration.name + '/';
  var network = new Network({
    id: configuration.clientId.replace(/ /g, ''),
    name: configuration.name,
    preferedNetworkId: configuration.preferedNetworkId,
    products: products,
    gatewayClient: gatewayClient,
    callbackUrl: callbackUrl
  });
  return network;
};

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

module.exports = new NetworkFactory();