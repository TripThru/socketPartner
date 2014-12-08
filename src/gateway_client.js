var io = require('socket.io-client');
var querystring = require('querystring');
var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var logger = require('./logger');

function GatewayClient(id, name) {
  Gateway.call(this, id, name);
  this.socket = null;
  this.listener = null;
}

GatewayClient.prototype.setListener = function(listener) {
  Interface.ensureImplements(listener, IGateway);
  this.listener = listener;
  
  //Trips
  this.socket.on('dispatch-trip', function(req, cb){
    this.listener.dispatchTrip(req, cb);
  });
  this.socket.on('get-trip', function(req, cb){
    this.listener.getTrip(req, cb);
  });
  this.socket.on('get-trip-status', function(req, cb){
    this.listener.getTripStatus(req, cb);
  });
  this.socket.on('update-trip-status', function(req, cb){
    this.listener.updateTripStatus(req, cb);
  });
  
  //Quotes
  this.socket.on('create-quote', function(req, cb){
    this.listener.createQuote(req, cb);
  });
  this.socket.on('get-quote', function(req, cb){
    this.listener.getQuote(req, cb);
  });
  this.socket.on('update-quote', function(req, cb){
    this.listener.updateQuote(req, cb);
  });
  
  //Users
  this.socket.on('get-partner-info', function(req ,cb){
    this.listener.getPartnerInfo(req, cb);
  });
};

GatewayClient.prototype.open = function(url, token, cb) {
  this.socket = io.connect(url, {
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
  return new Promise(function(resolve, reject){
    self.socket.emit(action, request, function(res){
      logger.log('socket', 'Emitted ' + action + ' ' + request.id + ', res: ' + res.result);
      resolve(res);
    });
  });
};

GatewayClient.prototype.getPartnerInfo = function(request) {
  return this.emit('get-partner-info', request);
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