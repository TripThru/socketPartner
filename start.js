var networkConfigName = process.argv[2];
if(!networkConfigName) {
  throw new Error('Please specify a network configuration name');
}
var healthcheck = require('./healthcheck');
var logger = require('./src/logger');
var server = require('./server');
var fs = require('fs');
var GatewayClient = require('./src/gateway_client');
var NetworkFactory = require('./src/network_factory');
var configDirectory = './network_config/';
var globalConfig = require('./config');

function start(network, interval) {
  network
    .update()
    .then(function(){
      setTimeout(function(){
        start(network, interval);
      }, interval);
    })
    .error(function(err){
      logger.log('sim', 'Network ' + network.id + ' crashed: ' + err);
    });
}

var started = {};

function runOneNetwork(name) {
  var config = require(configDirectory + name);
  config.tripthru.url = globalConfig.tripthru.url;
  logger.log('init', 'Loading configuration ' + name);
  var simulationInterval = config.simulationInterval*1000;
  var client = new GatewayClient('client' + config.name, 'client' + config.name, 
      config.clientId);
  logger.log('init', 'Creating network ' + name + 'from configuration...');
  var network = NetworkFactory.createNetwork(client, config);

  logger.log('init', 'Opening socket client ' + name + '...');
  client.open(config.tripthru.url, config.tripthru.token, function() {
    logger.log('init', 'Socket open, starting simulation ' + name + '...');
    client.setListener(network);
    if(!started.hasOwnProperty(name)){
      started[name] = true;
      network
        .setNetworkInfoAtTripThru()
        .then(function(){
          setTimeout(function(){
            start(network, simulationInterval);
          }, 5000);
        });
    }
  });
  
  return network;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startServer(networksById){
  server.init(networksById);
}

function runAllNetworks() {
  var files = fs.readdirSync(configDirectory);
  var networksById = [];
  for(var i = 0; i < files.length; i++) {
    if(endsWith(files[i].toString(), '.js')) {
      var network = runOneNetwork(files[i]);
      networksById[network.id] = network;
    }
  }
  logger.log('init', 'Starting express...');
  startServer(networksById);
}

var configName = process.argv[2];
if(!configName) {
  throw new Error('Please specify a configuration name or \'all\' to run all');
}
if(configName === 'all') {
  runAllNetworks();
} else {
  runOneNetwork(configName);
}