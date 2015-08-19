var Interface = require('../../src/interface').Interface;
var should = require('should');
var sinon = require('sinon');
var Promise = require('bluebird');
var maptools = require('../../src/map_tools').MapTools;
var TripThruApiFactory = require('../../src/tripthru_api_factory');
var SocketClient = require('../../src/socket_client');
var RestfulClient = require('../../src/restful_client');
var NetworkFactory = require('../../src/network_factory');
var resultCodes = require('../../src/codes').resultCodes;
var apiConfig = require('../config/api');

function resetSandbox(sandbox) {
  (sandbox.fakes || []).forEach(function(fake) {
    if (typeof fake.reset === 'function') {
        fake.reset();
    }
   });
}

function setupSecureCredentials(apiConfig) {
  if(!apiConfig.tripthru.cert) {
    throw new Error('No certificate path configured.');
  }
  if(!apiConfig.tripthru.key) {
    throw new Error('No key path configured.');
  }
  if(!apiConfig.tripthru.passphrase) {
    throw new Error('No ssl passphrase configured.');
  }
  https.globalAgent.options.rejectUnauthorized = false;
  https.globalAgent.options.cert = fs.readFileSync(apiConfig.tripthru.cert);
  https.globalAgent.options.key = fs.readFileSync(apiConfig.tripthru.key);
  https.globalAgent.options.passphrase = apiConfig.tripthru.passphrase;
}

function TripLifeCycle(localNetworkConfig, foreignNetworkConfig, tripConfig) {
  this.localNetworkConfig = localNetworkConfig;
  this.foreignNetworkConfig = foreignNetworkConfig;
  this.tripConfig = tripConfig;
  this.sandbox = sinon.sandbox.create();
  this.localClient;
  this.localClientSpy;
  this.localNetworkSpy;
  this.localNetwork;
  this.localProduct;
  this.foreignClient;
  this.foreignClientSpy;
  this.foreignNetworkSpy;
  this.foreignNetwork;
  this.foreignProduct;
  this.trip;
  this.sentForeignStatuses = [];
  this.currentUpdateCall = -1;
  var self = this;
  
  if(localNetworkConfig.endpointType === 'socket') {
    this.localClient = new SocketClient(localNetworkConfig.clientId, localNetworkConfig.name, localNetworkConfig.clientId,
      apiConfig.secureConnection);
  } else {
    this.localClient = new RestfulClient(localNetworkConfig.clientId, localNetworkConfig.name, apiConfig, 
      localNetworkConfig.tripthru.token, apiConfig.cert, apiConfig.key, apiConfig.passphrase, apiConfig.secureConnection);
  }
  this.localNetwork = NetworkFactory.createNetwork(this.localClient, localNetworkConfig);
	this.localProduct = this.localNetwork.products[0];
  if(localNetworkConfig.endpointType === 'socket') {
    this.localClient.setListener(this.localNetwork);
  }
  
  if(foreignNetworkConfig.endpointType === 'socket') {
    this.foreignClient = new SocketClient(foreignNetworkConfig.clientId, foreignNetworkConfig.name, foreignNetworkConfig.clientId,
      apiConfig.secureConnection);
  } else {
    this.foreignClient = new RestfulClient(foreignNetworkConfig.clientId, foreignNetworkConfig.name, apiConfig, 
      foreignNetworkConfig.tripthru.token, apiConfig.cert, apiConfig.key, apiConfig.passphrase, apiConfig.secureConnection);
  }
  // Wrap update trip status to track status changes
  var originalUpdateTripStatus = this.foreignClient.updateTripStatus;
  this.foreignClient.updateTripStatus = function(request) {
    self.sentForeignStatuses.push(request.status);
    return originalUpdateTripStatus.apply(this, [request]);
  };
  this.foreignNetwork = NetworkFactory.createNetwork(this.foreignClient, foreignNetworkConfig);
	this.foreignProduct = this.foreignNetwork.products[0];
  if(foreignNetworkConfig.endpointType === 'socket') {
    this.foreignClient.setListener(this.foreignNetwork);
  }
	
	this.trip = this.localProduct.createTrip(tripConfig.customer, tripConfig.pickupTime, tripConfig.from, tripConfig.to);
   
	this.localClientSpy = {
	  setNetworkInfo: this.sandbox.spy(this.localClient, 'setNetworkInfo'),
	  dispatchTrip: this.sandbox.spy(this.localClient, 'dispatchTrip'),
	  updateTripStatus: this.sandbox.spy(this.localClient, 'updateTripStatus'),
	  requestPayment: this.sandbox.spy(this.localClient, 'requestPayment'),
	  acceptPayment: this.sandbox.spy(this.localClient, 'acceptPayment')
	};
	this.localNetworkSpy = {
	  dispatchTrip: this.sandbox.spy(this.localNetwork, 'dispatchTrip'),
	  updateTripStatus: this.sandbox.spy(this.localNetwork, 'updateTripStatus'),
	  requestPayment: this.sandbox.spy(this.localNetwork, 'requestPayment'),
	  acceptPayment: this.sandbox.spy(this.localNetwork, 'acceptPayment')
	};
	this.localNetwork.getQuote = function(req) {
	  return Promise.resolve(TripThruApiFactory.createFailResponse('test client', resultCodes.rejected));
	};
	this.foreignClientSpy = {
	  setNetworkInfo: this.sandbox.spy(this.foreignClient, 'setNetworkInfo'),
	  dispatchTrip: this.sandbox.spy(this.foreignClient, 'dispatchTrip'),
	  updateTripStatus: this.sandbox.spy(this.foreignClient, 'updateTripStatus'),
	  requestPayment: this.sandbox.spy(this.foreignClient, 'requestPayment'),
	  acceptPayment: this.sandbox.spy(this.foreignClient, 'acceptPayment')
	};
	this.foreignNetworkSpy = {
	  dispatchTrip: this.sandbox.spy(this.foreignNetwork, 'dispatchTrip'),
	  updateTripStatus: this.sandbox.spy(this.foreignNetwork, 'updateTripStatus'),
	  requestPayment: this.sandbox.spy(this.foreignNetwork, 'requestPayment'),
	  acceptPayment: this.sandbox.spy(this.foreignNetwork, 'acceptPayment')
	};
	this.foreignNetwork.getQuote = function(req) {
	  return Promise.resolve(TripThruApiFactory.createFailResponse('test client', resultCodes.rejected));
	};
};

TripLifeCycle.prototype.waitForStatus = function(status, delay) {
  delay = delay || 0;
  return this.foreignProduct
    .processQueue()
    .bind(this)
    .delay(delay)
    .then(function(){
      if(this.sentForeignStatuses.indexOf(status) === -1) {
        return this.waitForStatus(status, 5000);
      } else {
        return Promise.resolve();
      }
    });
};

TripLifeCycle.prototype.verifyLastStatusUpdate = function(status) {
  var statuses;
  switch(this.foreignNetworkConfig.simulationType) {
    case 'cabify':
      statuses = ['accepted', 'arrived', 'picked_up', 'dropped_off', 'completed'];
      break;
    case 'hailo':
      statuses = ['accepted', 'arrived', 'picked_up', 'completed'];
      break;
    case 'taxibeat':
      statuses = ['accepted', 'en_route', 'arrived', 'picked_up', 'completed'];
      break;
    default: 
      statuses = ['accepted', 'en_route', 'picked_up', 'completed'];
  }
  var callIndex = statuses.indexOf(status);
  
  // Verify foreign network sent status update
  this.foreignClientSpy.updateTripStatus.called.should.be.equal(true, 'Should have sent status update ' + status);
  should.exists(this.foreignClientSpy.updateTripStatus.getCall(callIndex), 'Expected received status ' + status + ' not found');
  var sentStatus = this.foreignClientSpy.updateTripStatus.getCall(callIndex).args[0].status;
  sentStatus.should.be.equal(status, 'Expected '  + status + ' foreign status but got ' + sentStatus);
  
  // Verify originating network got update
  this.localNetworkSpy.updateTripStatus.called.should.be.equal(true, 'Should have received status update');
  should.exists(this.localNetworkSpy.updateTripStatus.getCall(callIndex), 'Expected sent status ' + status + ' not found');
  var receivedStatus = this.localNetworkSpy.updateTripStatus.getCall(callIndex).args[0].status;
  receivedStatus.should.be.equal(status, 'Expected ' + status + ' local status but got ' + receivedStatus);
  
  return this.localClient
  	.getTripStatus({ id: this.trip.publicId })
    .bind(this)
  	.then(function(res){
  	  res.result_code.should.be.equal(resultCodes.ok, res.result);
      var lastStatus = this.sentForeignStatuses[this.sentForeignStatuses.length-1];
  	  res.status.should.be.equal(lastStatus, 'Expected ' + lastStatus + ' TripThru status but got ' + res.status);
  	});
};

TripLifeCycle.prototype.openRestfulConnection = function(client) {
  return Promise.resolve();
};

TripLifeCycle.prototype.openSocketConnection = function(client, token) {
  return client.open(apiConfig.url, token);
};

TripLifeCycle.prototype.openConnections = function() {
  if(apiConfig.secureConnection) {
    setupSecureCredentials();
  }
  if(this.localNetworkConfig.endpointType === 'socket') {
    var openLocal = this.openSocketConnection(this.localClient, this.localNetworkConfig.tripthru.token);
  } else {
    var openLocal = this.openRestfulConnection(this.localClient);
  }
  if(this.foreignNetworkConfig.endpointType === 'socket') {
    var openForeign = this.openSocketConnection(this.foreignClient, this.foreignNetworkConfig.tripthru.token);
  } else {
    var openForeign = this.openRestfulConnection(this.foreignClient);
  }
  return Promise
    .settle([openLocal, openForeign])
    .then(function(results){
      results[0].isFulfilled().should.be.equal(true, 'Opening local network client failed');
      results[1].isFulfilled().should.be.equal(true, 'Opening foreign network client failed');
    });
};

TripLifeCycle.prototype.setNetworkInfo = function() {
  return Promise
    .settle([
      this.localNetwork.setNetworkInfoAtTripThru(),
      this.foreignNetwork.setNetworkInfoAtTripThru()
    ])
    .bind(this)
    .then(function(results){
      this.localClientSpy.setNetworkInfo.calledOnce.should.be.equal(true, 'Called local set network info more than once');
      this.foreignClientSpy.setNetworkInfo.calledOnce.should.be.equal(true, 'Called foreign set network info more than once');
      results[0].isFulfilled().should.be.equal(true, 'Setting local network info failed');
      results[1].isFulfilled().should.be.equal(true, 'Setting foreign network info failed');
      results[0].value().result_code.should.be.equal(resultCodes.ok, 'Expecting local result_code to be OK');
      results[1].value().result_code.should.be.equal(resultCodes.ok, 'Expecting foreign result_code to be OK');
    });
};

TripLifeCycle.prototype.dispatchTrip = function() {
  this.localProduct.queueTrip(this.trip).should.be.equal(true, 'Queueing trip failed');
  return this.localProduct
    .processTrip(this.trip)
    .bind(this)
    .then(function(){
      this.trip.status.should.be.equal('accepted', 'Trip should have advanced to accepted status but got ' + this.trip.status);
      return this.localClient.getTripStatus({ id: this.trip.publicId });
    })
    .then(function(res){
      res.result_code.should.be.equal(resultCodes.ok, 'Trip not found at TripThru');
      this.localClientSpy.dispatchTrip.calledOnce.should.be.equal(true, 'Tried to dispatch more than once');
      this.foreignNetworkSpy.dispatchTrip.called.should.be.equal(true, 'Didn\'t receive dispatch request');
    });
};

TripLifeCycle.prototype.verifyAcceptedStatus = function() {
  return this.foreignProduct
    .processQueue()
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('accepted');
    });
};

TripLifeCycle.prototype.verifyEnrouteStatus = function() {
  return this.waitForStatus('en_route')
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('en_route');
    });
};

TripLifeCycle.prototype.verifyArrivedStatus = function() {
  return this.waitForStatus('arrived')
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('arrived');
    })
    .then(function(){
      // Verify driver reached pickup location
      maptools.locationsAreEqual(this.trip.pickupLocation, this.trip.driver.location).should.be.equal(true, 'Driver not at pickup location');
    });
};

TripLifeCycle.prototype.verifyPickedUpStatus = function() {
  return this.waitForStatus('picked_up')
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('picked_up');
    })
    .then(function(){
      // Verify driver reached pickup location
      maptools.locationsAreEqual(this.trip.pickupLocation, this.trip.driver.location).should.be.equal(true, 'Driver not at pickup location');
    });
};

TripLifeCycle.prototype.verifyDroppedOffStatus = function() {
  return this.waitForStatus('dropped_off')
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('dropped_off');
    })
    .then(function(){
      //Verify driver reached dropoff location
      maptools.locationsAreEqual(this.trip.dropoffLocation, this.trip.driver.location).should.be.equal(true, 'Driver not at dropoff location');
    });
};

TripLifeCycle.prototype.verifyCompletedStatus = function() {
  return this.waitForStatus('completed')
    .bind(this)
    .then(function(){
      return this.verifyLastStatusUpdate('completed');
    })
    .then(function(){
      //Verify driver reached dropoff location
      maptools.locationsAreEqual(this.trip.dropoffLocation, this.trip.driver.location).should.be.equal(true, 'Driver not at dropoff location');
    });
};

TripLifeCycle.prototype.verifyPaymentTransaction = function() {
  // Payment request
  this.foreignClientSpy.requestPayment.called.should.be.equal(true, 'Foreign network didn\'t request payment');
  this.foreignClientSpy.requestPayment.calledOnce.should.be.equal(true, 'Foreign network requested payment more than once');
  this.localNetworkSpy.requestPayment.called.should.be.equal(true, 'Local network didn\'t receive payment request');
  // Payment confirmation
  this.localClientSpy.acceptPayment.called.should.be.equal(true, 'Local network didn\'t confirm payment');
  this.localClientSpy.acceptPayment.calledOnce.should.be.equal(true, 'Local network confirmed payment more than once');
  this.foreignNetworkSpy.acceptPayment.called.should.be.equal(true, 'Foreign network didn\'t receive payment confirmation');
  return Promise.resolve();
};

TripLifeCycle.prototype.closeConnections = function() {
  this.localClient.disconnect();
  this.foreignClient.disconnect();
};

module.exports = TripLifeCycle;

