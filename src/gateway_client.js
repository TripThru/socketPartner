var io = require('socket.io-client');
var querystring = require('querystring');
var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var logger = require('./logger');

function GatewayClient(id, name, clientId) {
  Gateway.call(this, id, name);
  this.socket = null;
  this.listener = null;
  this.clientId = clientId;
}

GatewayClient.prototype.setListener = function(listener) {
  Interface.ensureImplements(listener, IGateway);
  this.listener = listener;
  
  //Trips
  this.socket.on('dispatch-trip', function(req, cb){
    this.listener.dispatchTrip(req, cb);
  }.bind(this));
  this.socket.on('get-trip', function(req, cb){
    this.listener.getTrip(req, cb);
  }.bind(this));
  this.socket.on('get-trip-status', function(req, cb){
    this.listener.getTripStatus(req, cb);
  }.bind(this));
  this.socket.on('update-trip-status', function(req, cb){
    this.listener.updateTripStatus(req, cb);
  }.bind(this));
  this.socket.on('request-payment', function(req, cb){
    this.listener.requestPayment(req, cb);
  }.bind(this));
  this.socket.on('accept-payment', function(req, cb){
    this.listener.acceptPayment(req, cb);
  }.bind(this));
  
  //Quotes
  this.socket.on('quote-trip', function(req, cb){
    this.listener.quoteTrip(req, cb);
  }.bind(this));
  this.socket.on('get-quote', function(req, cb){
    this.listener.getQuote(req, cb);
  }.bind(this));
  this.socket.on('update-quote', function(req, cb){
    this.listener.updateQuote(req, cb);
  }.bind(this));
  
  //Users
  this.socket.on('get-partner-info', function(req ,cb){
    this.listener.getPartnerInfo(req, cb);
  }.bind(this));
};

GatewayClient.prototype.open = function(url, token, cb) {
  this.socket = io.connect(url, {
    forceNew: true,
    query: querystring.stringify({token:token}),
    transports: ['websocket']
  });
  
  this.socket.on('connect', function (){
    logger.log('init', 'Connected to ' + url);
    cb();
  });
  
  this.socket.on('error', function (data){
    logger.log('error on ' + url, data);
  });
  
  this.socket.on('disconnect', function (){
    logger.log('disconnect from ' + url);
  });
  
  this.socket.on('hi', function(msg, cb){
    logger.log(msg);
    cb('hi');
  });
};

GatewayClient.prototype.emit = function(action, request) {
  var self = this;
  request.clientId = this.clientId;
  return new Promise(function(resolve, reject){
    self.socket.emit(action, request, function(res){
      logger.log(self.listener.id, 'Emitted ' + action + ' ' + request.id + ', res: ' + res.result);
      resolve(res);
    });
  });
};

GatewayClient.prototype.getPartnerInfo = function(request) {
  return this.emit('get-partner-info', request);
};

GatewayClient.prototype.setPartnerInfo = function(request) { 
  return this.emit('set-partner-info', request);
};

GatewayClient.prototype.dispatchTrip = function(request) {
  return this.emit('dispatch-trip', request);
};

GatewayClient.prototype.getTrip = function(request) {
  return this.emit('get-trip', request);
};

GatewayClient.prototype.getTripStatus = function(request) {
  return this.emit('get-trip-status', request);
};

GatewayClient.prototype.updateTripStatus = function(request) {
  return this.emit('update-trip-status', request);
};

GatewayClient.prototype.requestPayment = function(request) {
  return this.emit('request-payment', request);
};

GatewayClient.prototype.acceptPayment = function(request) {
  return this.emit('accept-payment', request);
};

GatewayClient.prototype.quoteTrip = function(request) {
  return this.emit('quote-trip', request);
};

GatewayClient.prototype.updateQuote = function(request) {
  return this.emit('update-quote', request);
};

GatewayClient.prototype.getQuote = function(request) {
  return this.emit('get-quote', request);
};

module.exports = GatewayClient;