var TripLifeCycle = require('./helpers/trip_life_cycle');
var store = require('../src/store');
var localNetworkConfig = require('./config/ny_network');
var foreignNetworkConfig = require('./config/la_network');
var tripConfig = require('./fixtures/la_trip');
var tripLifeCycle;

describe('Hailo state machine trip life cycle tests', function(){
  this.timeout(360000);
  
  before(function(){
    store.clear();
    localNetworkConfig.simulationType = 'hailo';
    foreignNetworkConfig.simulationType = 'hailo';
    tripLifeCycle = new TripLifeCycle(localNetworkConfig, foreignNetworkConfig, tripConfig);
  });
  
  it('should open connection successfully', function(done){
    tripLifeCycle.openConnections().then(done);
  });
  
  it('should set network info successfully', function(done){
    tripLifeCycle.setNetworkInfo().then(done);
  });
  
  it('should dispatch a trip successfully to a foreign network', function(done){
    tripLifeCycle.dispatchTrip().then(done);
  });
  
  it('should receive accepted status update from foreign network', function(done){
    tripLifeCycle.verifyAcceptedStatus().then(done);
  });
  
  it('should receive arrived status update from foreign network', function(done){
    tripLifeCycle.verifyArrivedStatus().then(done);
  });
  
  it('should receive picked_up status update from foreign network when driver reaches pickup location', function(done){
    tripLifeCycle.verifyPickedUpStatus().then(done);
  });
  
  it('should received completed status from foreign network when driver reaches dropoff location', function(done){
    tripLifeCycle.verifyCompletedStatus().then(done);
  });
  
  it('should receive payment request from foreign network and confirm payment', function(done){
    tripLifeCycle.verifyPaymentTransaction().then(done);
  });
  
  after(function(){
    store.clear();
    tripLifeCycle.closeConnections();
  });
  
});