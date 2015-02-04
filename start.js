var partnerConfigName = process.argv[2];
if(!partnerConfigName) {
  throw new Error('Please specify a partner configuration name');
}
var healthcheck = require('./healthcheck');
var logger = require('./src/logger');
var server = require('./server');
var fs = require('fs');
var GatewayClient = require('./src/gateway_client');
var PartnerFactory = require('./src/partner_factory');
var configDirectory = './partner_config/';
var globalConfig = require('./config');

function start(partner, interval) {
  partner
    .update()
    .then(function(){
      setTimeout(function(){
        start(partner, interval);
      }, interval);
    })
    .error(function(err){
      logger.log('sim', 'Partner ' + partner.id + ' crashed: ' + err);
    });
}

var started = {};

function runOnePartner(name) {
  var config = require(configDirectory + name);
  config.tripthru.url = globalConfig.tripthru.url;
  logger.log('init', 'Loading configuration ' + name);
  var simulationInterval = config.simulationInterval*1000;
  var client = new GatewayClient('client' + config.name, 'client' + config.name, 
      config.clientId);
  logger.log('init', 'Creating partner ' + name + 'from configuration...');
  var partner = PartnerFactory.createPartner(client, config);

  logger.log('init', 'Opening socket client ' + name + '...');
  client.open(config.tripthru.url, config.tripthru.token, function() {
    logger.log('init', 'Socket open, starting simulation ' + name + '...');
    client.setListener(partner);
    if(!started.hasOwnProperty(name)){
      started[name] = true;
      partner.setPartnerInfoAtTripThru(function(){
        setTimeout(function(){
          start(partner, simulationInterval);
        }, 5000);
      });
    }
  });
  
  return partner;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startServer(partnersById){
  server.init(partnersById);
}

function runAllPartners() {
  var files = fs.readdirSync(configDirectory);
  var partnersById = [];
  for(var i = 0; i < files.length; i++) {
    if(endsWith(files[i].toString(), '.js')) {
      var partner = runOnePartner(files[i]);
      partnersById[partner.id] = partner;
    }
  }
  logger.log('init', 'Starting express...');
  startServer(partnersById);
}

var configName = process.argv[2];
if(!configName) {
  throw new Error('Please specify a configuration name or \'all\' to run all');
}
if(configName === 'all') {
  runAllPartners();
} else {
  runOnePartner(configName);
}