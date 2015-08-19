var Promise = require('bluebird');
var Gateway = require('./gateway').Gateway;
var IGateway = require('./gateway').IGateway;
var Interface = require('./interface').Interface;
var request = require('request');
var logger = require('./logger');
var fs = require('fs');

function RestfulClient(id, name, rootUrl, token, cert, key, passphrase, secureConnection) {
  this.id = id;
  this.name = name;
  this.rootUrl = rootUrl;
  this.token = token;
  this.options = {
    timeout: 60000,
    followRedirect: true,
    maxRedirects: 10,
    json: true
  };
  if(secureConnection) {
    this.options.agentOptions = {
      cert: fs.readFileSync(cert),
      key: fs.readFileSync(key),
      passphrase: passphrase,
      rejectUnauthorized: false,
      securityOptions: 'SSL_OP_NO_SSLv3'
    }; 
  }
  Gateway.call(this, id, name);
}

RestfulClient.prototype.get = function(path, id, req) {
  return new Promise(function(resolve, reject){
    if(id) {
      path += '/' + id;
    }
    var client_id = this.id;
    var url = this.rootUrl + path + '?token=' + this.token;
    request({
      url: url,
      method: 'GET',
      timeout: this.options.timeout,
      followRedirect: this.options.followRedirect,
      maxRedirects: this.options.maxRedirects,
      body: req,
      json: this.options.json,
      agentOptions: this.options.agentOptions
    }, function(error, response, body){
      if(error) {
        logger.log(client_id, 'GET ' + path + ', error: ' + error);
        reject(error);
      } else {
        logger.log(client_id, 'GET ' + path + ', res: ' + body.result_code);
        resolve(body);
      }
    });
  }.bind(this));
};

RestfulClient.prototype.post = function(path, id, req) {
  return new Promise(function(resolve, reject){
    if(id) {
      path += '/' + id;
    }
    var client_id = this.id;
    var url = this.rootUrl + path + '?token=' + this.token;
    request({
      url: url,
      method: 'POST',
      timeout: this.options.timeout,
      followRedirect: this.options.followRedirect,
      maxRedirects: this.options.maxRedirects,
      body: req,
      json: this.options.json,
      agentOptions: this.options.agentOptions
    }, function(error, response, body){
      if(error) {
        logger.log(client_id, 'POST ' + path + ', error: ' + error);
        reject(error);
      } else {
        logger.log(client_id, 'POST ' + path + ', res: ' + body.result_code);
        resolve(body);
      }
    });
  }.bind(this));
};

RestfulClient.prototype.put = function(path, id, req) {
  return new Promise(function(resolve, reject){
    if(id) {
      path += '/' + id;
    }
    var client_id = this.id;
    var url = this.rootUrl + path + '?token=' + this.token;
    request({
      url: url,
      method: 'PUT',
      timeout: this.options.timeout,
      followRedirect: this.options.followRedirect,
      maxRedirects: this.options.maxRedirects,
      body: req,
      json: this.options.json,
      agentOptions: this.options.agentOptions
    }, function(error, response, body){
      if(error) {
        logger.log(client_id, 'PUT ' + path + ', error: ' + error);
        reject(error);
      } else {
        logger.log(client_id, 'PUT ' + path + ', res: ' + body.result_code);
        resolve(body);
      }
    });
  }.bind(this));
};

RestfulClient.prototype.dispatchTrip = function(request) {
  return this.post('trip', request.id, request);
};

RestfulClient.prototype.getTripStatus = function(request) {
  return this.get('tripstatus', request.id, request);
};

RestfulClient.prototype.updateTripStatus = function(request) {
  return this.put('tripstatus', request.id, request);
};

RestfulClient.prototype.getQuote = function(request) {
  return this.get('quote', request.id, request);
};

RestfulClient.prototype.getNetworkInfo = function(request) {
  return this.get('network', request.id, request);
};

RestfulClient.prototype.setNetworkInfo = function(request) {
  return this.post('network', null, request);
};

RestfulClient.prototype.requestPayment = function(request) {
  return this.post('payment', request.id, request);
};

RestfulClient.prototype.acceptPayment = function(request) {
  return this.put('payment', request.id, request);
};

RestfulClient.prototype.getDriversNearby = function(request) {
  return this.get('drivers', null, request);
};

RestfulClient.prototype.getTrip = function(request) {
  return this.get('trip', request.id, request);
};

module.exports = RestfulClient;
