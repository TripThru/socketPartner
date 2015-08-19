var healthcheck = require('./healthcheck');
var logger = require('./src/logger');
var server = require('./server');
var bookingsServer = require('./bookings_server');
var fs = require('fs');
var SocketClient = require('./src/socket_client');
var RestfulClient = require('./src/restful_client');
var NetworkFactory = require('./src/network_factory');
var configDirectory = './network_config/';
var globalConfig = require('./config');
var https = require('https');

function setupSecureCredentials() {
  if(!globalConfig.tripthru.cert) {
    throw new Error('No certificate path configured.');
  }
  if(!globalConfig.tripthru.key) {
    throw new Error('No key path configured.');
  }
  if(!globalConfig.tripthru.passphrase) {
    throw new Error('No ssl passphrase configured.');
  }
  https.globalAgent.options.rejectUnauthorized = false;
  https.globalAgent.options.cert = fs.readFileSync(globalConfig.tripthru.cert);
  https.globalAgent.options.key = fs.readFileSync(globalConfig.tripthru.key);
  https.globalAgent.options.passphrase = globalConfig.tripthru.passphrase;
}

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
  globalConfig.tripthru.token = config.tripthru.token;
  config.tripthru = globalConfig.tripthru;
  logger.log('init', 'Loading configuration ' + name);
  var simulationInterval = config.simulationInterval * 1000;
  logger.log('init', 'Creating network ' + name + 'from configuration...');
  var client = createGatewayClient(config);
  var network = NetworkFactory.createNetwork(client, config);
  if(config.endpointType === 'socket') {
    logger.log('init', 'Opening socket client ' + name + '...');
    client
      .open(config.tripthru.url, config.tripthru.token, config.tripthru.cert,
        config.tripthru.key, config.tripthru.passphrase)
      .then( function() {
        logger.log('init', 'Socket open, starting simulation ' + name + '...');
        client.setListener(network);
        setNetworkInfoAndStartSimulation(network, simulationInterval);
      });
  } else {
    logger.log('init', 'Starting simulation ' + name + '...');
    setNetworkInfoAndStartSimulation(network, simulationInterval);
  }
  return network;
}

function setNetworkInfoAndStartSimulation(network, simulationInterval) {
  if(!started.hasOwnProperty(network.name)) {
    started[network.name] = true;
    network
      .setNetworkInfoAtTripThru()
      .then(function(){
        setTimeout(function(){
          start(network, simulationInterval);
        }, 5000);
      });
  } else {
    throw new Error(network.name + ' is already running');
  }
}

function createGatewayClient(config) {
  if(!config.tripthru.token) {
    throw new Error('No access token configured.');
  }
  var client;
  if(config.endpointType === 'socket') {
    client = new SocketClient('client ' + config.name, 'client' + config.name,
      config.clientId, config.tripthru.secureConnection);
  } else if(config.endpointType === 'restful') {
    client = new RestfulClient('client ' + config.name, 'client' + config.name,
        config.tripthru.url, config.tripthru.token, config.tripthru.cert, config.tripthru.key,
        config.tripthru.passphrase, config.tripthru.secureConnection);
  } else {
    throw new Error('Unknown endpoint type');
  }
  return client;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startServer(networksById){
  server.init(networksById);
}

function startBookingsServer(networksById) {
  bookingsServer.init(networksById);
};

function runAllNetworks() {
  var files = fs.readdirSync(configDirectory);
  var networksById = [];
  for(var i = 0; i < files.length; i++) {
    if(endsWith(files[i].toString(), '.js')) {
      var network = runOneNetwork(files[i]);
      networksById[network.id] = network;
    }
  }
}

var configName = process.argv[2];
if(!configName) {
  throw new Error('Please specify a configuration name or \'all\' to run all');
}
if(globalConfig.tripthru.secureConnection) {
  setupSecureCredentials();
}
var networksById = {};
if(configName === 'all') {
  networksById = runAllNetworks();
} else {
  var network = runOneNetwork(configName);
  networksById[network.id] = network;
}
logger.log('init', 'Starting express...');
startServer(networksById);
//startBookingsServer(networksById);