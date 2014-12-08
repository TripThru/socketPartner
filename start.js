var logger = require('./src/logger');
var config = require('./config');
var GatewayClient = require('./src/gateway_client');
var PartnerFactory = require('./src/Partner').PartnerFactory;

logger.log('init', 'Loading configurations...');
var simulationInterval = config.simulationInterval*1000;
var client = new GatewayClient('client', 'client');
logger.log('init', 'Creating partner from configuration...');
var partner = PartnerFactory.createPartner(client, config);

logger.log('init', 'Opening socket client...');
var firstTimeConnecting = true;
client.open(config.tripthru.url, config.tripthru.token, function() {
  logger.log('init', 'Socket open, starting simulation...');
  client.setListener(partner);
  if(firstTimeConnecting){
    firstTimeConnecting = false;
    start();
  }
});

var start = function() {
  partner
    .update()
    .then(function(){
      setTimeout(start, simulationInterval);
    });
};