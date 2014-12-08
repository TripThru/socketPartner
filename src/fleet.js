var Interface = require('./interface').Interface;
var Trip = require('./trip').Trip;
var logger = require('./logger');
var moment = require('moment');
var maptools = require('./map_tools').MapTools;
var Location = require('./map_tools').Location;
var Promise = require('bluebird');
var PromiseHelper = require('./promise_helper');

var IFleet = new Interface('fleet', ['simulate',
                                     'setPartner']);

function Fleet(config) {
  
  if(!config.id) {
    throw new Error('Id is required');
  }
  if(!config.name) {
    throw new Error('Name is required');
  }
  if(!config.location) {
    throw new Error('Location is required');
  }
  if(!config.coverage || !config.coverage.center || !config.coverage.radius) {
    throw new Error('Coverage is required');
  }
  if(!config.drivers || config.drivers.length === 0) {
    throw new Error('Drivers are required');
  }
  if(!config.passengers || config.passengers.length === 0) {
    throw new Error('Passengers are required');
  }
  if(!config.vehicleTypes || config.vehicleTypes.length === 0) {
    throw new Error('Vehicle types are required');
  }
  if(!config.possibleTrips || config.possibleTrips.length === 0) {
    throw new Error('Possible trips are required');
  }
  if(!config.costPerMile) {
    throw new Error('Cost per mile is required');
  }
  if(!config.baseCost) {
    throw new Error('Base cost is required');
  }
  if(!config.tripsPerHour) {
    throw new Error('Trips per hour is required');
  }
  if(!config.maxActiveTrips) {
    throw new Error('Max active trips is required');
  }
  if(!config.simulationInterval) {
    throw new Error('Simulation interval is required');
  }
  
  this.id = config.id.replace(/ /g, '');
  this.name = config.name;
  this.location = new Location(config.location.lat, config.location.lng);
  this.coverage = config.coverage;
  this.passengers = config.passengers;
  this.vehicleTypes = config.vehicleTypes;
  this.possibleTrips = config.possibleTrips;
  this.costPerMile = config.costPerMile;
  this.baseCost = config.baseCost;
  this.tripsPerHour = config.tripsPerHour;
  this.maxActiveTrips = config.maxActiveTrips;
  this.simulationInterval = moment.duration(config.simulationInterval, 'seconds');
  this.tripMaxAdvancedNotice = moment.duration(5, 'minutes');
  this.removalAge = moment.duration(5, 'minutes');
  this.retryInterval = moment.duration(3, 'minutes');
  this.missedPeriod = moment.duration(15, 'minutes');
  this.criticalPeriod = moment.duration(15, 'minutes');
  this.updateInterval = moment.duration(30, 'seconds');
  this.expectedDelayWhenNoDriversAvailable = moment.duration(3, 'hours');
  this.nextId = 0;
  this.partner = null;
  this.queue = [];
  
  this.drivers = {};
  this.availableDrivers = [];
  this.returningDrivers = [];
  for(var i = 0; i < config.drivers.length; i++) {
    this.addDriver({
      id: config.drivers[i],
      name: config.drivers[i]
    });
  }
}

Fleet.prototype.setPartner = function(partner) {
  this.partner = partner;
};

Fleet.prototype.addDriver = function(driver) {
  driver.fleet = this;
  driver.location = this.location;
  this.drivers[driver.id] = driver;
  this.availableDrivers.push(driver);
};

Fleet.prototype.simulate = function() {
  if(!this.partner) {
    throw new Error('partner not set');
  }
  this.generateRandomTrips();
  return this
    .processQueue()
    .bind(this)
    .then(function(){
      return this.updateReturningDriversLocation();
    });
};

Fleet.prototype.generateRandomTrips = function() {
  if(this.queue.length >= this.maxActiveTrips) {
    return;
  }
  
  var tripsToGenerate = 
    Math.floor(this.simulationInterval.asHours() * this.tripsPerHour);
  //this handles fractional trips
  var d = (this.simulationInterval.asHours() * this.tripsPerHour) - tripsToGenerate;
  if(d > Math.random()) {
    tripsToGenerate += 1;
  }
  if(tripsToGenerate > this.maxActiveTrips) {
    tripsToGenerate = this.maxActiveTrips;
  }
  if(tripsToGenerate < 1) { 
    return;
  }
  var now = moment();
  for(var i = 0; i < tripsToGenerate; i++) {
    this.generateRandomTrip(now);
  }
};

Fleet.prototype.generateRandomTrip = function(now) {
  var passenger = this.passengers[Math.floor(Math.random()*this.passengers.length)];
  var fromTo = this.possibleTrips[Math.floor(Math.random()*this.possibleTrips.length)];
  var pickupTime = moment(now).add(this.tripMaxAdvancedNotice);
  var from = new Location(fromTo.start.lat, fromTo.start.lng);
  var to = new Location(fromTo.end.lat, fromTo.end.lng);
  this.queueTrip(this.createTrip(passenger, pickupTime, from, to));
};

Fleet.prototype.createTrip = function(passengerName, pickupTime, from, to, foreignId) {
  var trip = new Trip({
    id: foreignId ? this.generatePrivateId(foreignId) : this.generateTripId(),
    idNumber: foreignId ? undefined : this.nextId,
    partner: this.partner,
    origination: 'local',
    pickupLocation: from,
    pickupTime: pickupTime,
    passenger: { id: passengerName, name: passengerName },
    dropoffLocation: to,
    paymentMethod: 'cash',
    fleet: this
  });
  logger.log('sim', passengerName + ' requests to be picked up at ' + from + ' on ' + pickupTime.format() + ' and dropped off at ' + to);
  return trip;
};

Fleet.prototype.queueTrip = function(trip) {
  if(this.availableDrivers.length === 0 && trip.origination === 'foreign') {
    return false;
  }
  logger.log('sim', 'Queueing ' + trip.id);
  this.queue.push(trip);
  if(this.partner.activeTripsByPublicId.hasOwnProperty(trip.publicId)) {
    throw new Error('sim', 'Trip ' + trip.id + ' already exists in active trips');
  }
  this.partner.addTrip(trip);
  trip.updateStatus(false, 'queued');
  return true;
};

Fleet.prototype.processQueue = function() {
  return PromiseHelper
    .runInSequence(this.queue, this.processTrip.bind(this))
    .bind(this)
    .then(function(){
      this.removeOldNonActiveTrips();
    });
};

Fleet.prototype.processTrip = function(trip) {
  switch(trip.status) {
    case 'queued':
      return this.processStatusQueued(trip);
    case 'dispatched':
      return this.processStatusDispatched(trip);
    case 'enroute':
      return this.processStatusEnroute(trip);
    case 'pickedup':
      return this.processStatusPickedUp(trip);
    case 'complete':
      //wait to be removed by removeIfTripOld
      break;
    default:
      throw new Error('Unexpected status (' + trip.status + '): ' + trip.id);
  }
};

Fleet.prototype.processStatusQueued = function(trip) {
  if(trip.autoDispatch && this.dispatchRetryIntervalReached(trip)) {
    trip.lastDispatchAttempt = moment();
    return this.dispatch(trip);
  }
  return Promise.resolve();
};

Fleet.prototype.dispatchRetryIntervalReached = function(trip) {
  var tryAgain = moment(trip.lastDispatchAttempt).add(this.retryInterval);
  return trip.lastDispatchAttempt === null || moment().isAfter(tryAgain);
};

Fleet.prototype.dispatch = function(trip) {
  if(trip.origination === 'local') {
    if(this.missedPeriodReached(trip)) {
      return this.cancelTrip(trip);
    }
    if(trip.service === 'foreign') {
      return Promise.resolve();
    }
  }
  if(this.criticalPeriodNotYetReached(trip)) {
    return Promise.resolve();
  }
  logger.log(trip.id, 'Ready to dispatch');
  
  return this
    .tryDispatchLocally(trip)
    .bind(this)
    .then(function(success){
      if(!success && trip.origination === 'local') {
        return this.partner.tryToDispatchToForeignProvider(trip);
      } else {
        return trip.updateStatus(true, 'dispatched', trip.driver.location, 
            trip.pickupTime);
      }
    });
};

Fleet.prototype.missedPeriodReached = function(trip) {
  return moment().isAfter(moment(trip.pickupTime).add(this.missedPeriod));
};

Fleet.prototype.criticalPeriodNotYetReached = function(trip) {
  return moment().isBefore(moment(trip.pickupTime).subtract(this.criticalPeriod));
};

Fleet.prototype.cancelTrip = function(trip) {
  logger.log(trip.id, 'Missed period reached: -- so cancel');
  var shouldNotifyPartner = trip.service === 'foreign';
  return trip.updateStatus(shouldNotifyPartner, 'cancelled');
};

Fleet.prototype.tryDispatchLocally = function(trip) {
  logger.log(trip.id, 'Dispatch locally');
  
  if(!this.servesLocation(trip.pickupLocation)) {
    logger.log(trip.id, 'Pickup location ' + trip.pickupLocation.id + 
        ' is outside of coverage area');
    return Promise.resolve(false);
  }
  if(trip.status !== 'queued') {
    logger.log(trip.id, 'Invalid status for dispatch: ' + trip.status);
    throw new Error('Invalid status for dispatch');
  }
  if(this.availableDrivers.length > 0) {
    this.dispatchToFirstAvailableDriver(trip);
    return this
      .partner
      .tryToCreateLocalTripAtTripThru(trip);
  } else {
    return Promise.resolve(false);
  }
};

Fleet.prototype.servesLocation = function(location) {
  return maptools.isInside(location, this.coverage);
};

Fleet.prototype.dispatchToFirstAvailableDriver = function(trip) {
  if(this.availableDrivers.length === 0) {
    throw new Error('Invalid condition: no available drivers');
  }
  trip.driver = this.availableDrivers.shift();
  trip.fleet = this;
  if(!trip.driver) {
    throw new Error('Invalid condition: driver is not defined');
  } 
  logger.log(trip.id, 'Dispatched to: ' + trip.driver.id);
};

Fleet.prototype.processStatusDispatched = function(trip) {
  if(trip.service === 'foreign') {
    return Promise.resolve();
  }
  return this
    .driverWillBeLateIfHeDoesntLeaveNow(trip)
    .bind(this)
    .then(function(willBeLate){
      if(willBeLate) {
        return this.makeTripEnroute(trip);
      }
      if(this.tripStatusUpdateIntervalReached(trip)) {
        this.logTheNewDriverLocation(trip);
      }
    });
};

Fleet.prototype.driverWillBeLateIfHeDoesntLeaveNow = function(trip) {
  if(!trip.driver) {
    throw new Error('Trip ' + trip.id + ' doesn\'t have a driver');
  }
  if(!trip.driver.location) {
    throw new Error('Trip ' + trip.id + ' doesn\'t have a driver location');
  }
  if(!trip.pickupLocation) {
    throw new Error('Trip ' + trip.id + ' doesn\'t have a pickup location');
  }
  return maptools
    .getRoute(trip.driver.location, trip.pickupLocation)
    .then(function(route){
      var m = moment(trip.pickupTime).subtract(route.duration);
      return moment().isAfter(m);
    });
};

Fleet.prototype.makeTripEnroute = function(trip) {
  logger.log(trip.id, 'Driver is now enroute');
  return this
    .updateDriverRouteAndGetETA(trip, trip.pickupLocation)
    .then(function(eta){
      return trip.updateStatus(true, 'enroute', trip.driver.location, eta);
    });
};

Fleet.prototype.updateDriverRouteAndGetETA = function(trip, destination) {
  trip.driver.routeStartTime = moment();
  return maptools
    .getRoute(trip.driver.location, destination)
    .then(function(route){
      trip.driver.route = route;
      var eta = moment().add(route.duration);
      logger.log(trip.id, trip.driver.name +  ' has a new route from ' + 
          trip.driver.location.id + ' to ' + destination.id + ': eta = ' + eta.format());
      return eta;
    });
};

Fleet.prototype.tripStatusUpdateIntervalReached = function(trip) {
  return !trip.lastUpdate || 
    moment().isAfter(moment(trip.lastUpdate).add(this.updateInterval));
};

Fleet.prototype.logTheNewDriverLocation = function(trip) {
  logger.log(trip.id, 'Status of driver: ' + trip.driver.location.id);
  trip.lastUpdate = moment();
};

Fleet.prototype.processStatusEnroute = function(trip) {
  if(trip.service === 'foreign') {
    return Promise.resolve();
  }
  if(this.driverHasReachedPickupLocation(trip)) {
    return this.makeTripPickedUp(trip);
  }
  this.updateTripDriverLocation(trip);
  if(this.tripStatusUpdateIntervalReached(trip)) {
    this.logTheNewDriverLocation(trip);
  }
  return Promise.resolve();
};

Fleet.prototype.updateTripDriverLocation = function(trip) {
  if(!trip.driver) {
    throw new Error('Driver is null');
  }
  if(!trip.driver.route) {
    throw new Error('Driver route is null');
  }
  trip.driver.location = 
    trip.driver.route.getCurrentWaypoint(trip.driver.routeStartTime, moment());
};

Fleet.prototype.driverHasReachedPickupLocation = function(trip) {
  return maptools.locationsAreEqual(trip.driver.location, trip.pickupLocation);
};

Fleet.prototype.makeTripPickedUp = function(trip) {
  logger.log(trip.id, 'Picking up');
  return this
    .updateDriverRouteAndGetETA(trip, trip.dropoffLocation)
    .then(function(eta){
      return trip.updateStatus(true, 'pickedup', trip.driver.location.id, eta);
    });
};

Fleet.prototype.processStatusPickedUp = function(trip) {
  if(trip.service === 'foreign') {
    return Promise.resolve();
  }
  if(this.destinationReached(trip)) {
    return this.makeTripComplete(trip);
  }
  this.updateTripDriverLocation(trip);
  if(this.tripStatusUpdateIntervalReached(trip)) {
    this.logTheNewDriverLocation(trip);
  }
  return Promise.resolve();
};

Fleet.prototype.destinationReached = function(trip) {
  return maptools.locationsAreEqual(trip.driver.location, trip.driver.route.end);
};

Fleet.prototype.makeTripComplete = function(trip) {
  logger.log(trip.id, 'The destination has been reached');
  trip.dropoffTime = moment();
  return trip
    .updateStatus(true, 'complete', trip.driver.location)
    .bind(this)
    .then(function(){
      this.completeTrip(trip);
    });
};

Fleet.prototype.completeTrip = function(trip) {
  this.returningDrivers.push(trip.driver);
  this.updateDriverRouteAndGetETA(trip, this.location);
  trip.eta = moment();
};

Fleet.prototype.removeOldNonActiveTrips = function() {
  var len = this.queue.length;
  while(--len >= 0) {
    var trip = this.queue[len];
    if(trip.status === 'cancelled' || trip.status === 'rejected') {
      var ageSinceCancelledOrRejected =
        moment.duration(moment().diff(trip.pickupTime));
      this.removeTripIfOld(len, trip, ageSinceCancelledOrRejected);
    }
    if(trip.status === 'complete') {
      if(this.agetSinceCompletedClockHasNotBeenSet(trip)) {
        this.startTheAgeSinceCompletedClockFromNow(trip);
      }
      var ageSinceCompleted = moment.duration(moment().diff(trip.dropoffTime));
      this.removeTripIfOld(len, trip, ageSinceCompleted);
    }
  }
};

Fleet.prototype.removeTripIfOld = function(index, trip, age) {
  if(age.asMinutes() > this.removalAge) {
    logger.log('sim', "Since old, remove " + trip.id);
    this.queue.splice(index-1, 1);
  }
};

Fleet.prototype.agetSinceCompletedClockHasNotBeenSet = function(trip) {
  return trip.dropoffTime === null;
};

Fleet.prototype.startTheAgeSinceCompletedClockFromNow = function(trip) {
  trip.dropoffTime = moment();
};

Fleet.prototype.updateReturningDriversLocation = function() {
  var len = this.returningDrivers.length;
  while(--len >= 0) {
    var driver = this.returningDrivers[len];
    this.updateDriverReturningLocation(driver);
    if(this.driverHomeOfficeReached(driver)) {
      logger.log('sim', 'Driver ' + driver.name + ' has reached the home office');
      this.availableDrivers.push(driver);
      this.returningDrivers.splice(len-1, 1);
    } else if(this.driverUpdateIntervalReached(driver)) {
      driver.lastUpdate = moment();
      logger.log(driver.name, 'Update ' + driver.location.id);
    }
  }
};

Fleet.prototype.updateDriverReturningLocation = function(driver) {
  driver.location = driver.route.getCurrentWaypoint(driver.routeStartTime, moment());
};

Fleet.prototype.driverHomeOfficeReached = function(driver) {
  return maptools.locationsAreEqual(driver.location, this.location);
};

Fleet.prototype.driverUpdateIntervalReached = function(driver) {
  return !driver.lastUpdate || 
    moment().isAfter(moment(driver.lastUpdate).add(this.updateInterval));
};

Fleet.prototype.generateTripId = function() {
  this.nextId++;
  return this.generatePrivateId(this.nextId + '@' + this.partner.id);
};

Fleet.prototype.generateTripPublicId = function(tripId) {
  return tripId.replace(this.id + '-', '');
};

Fleet.prototype.generatePrivateId = function(tripId) {
  return this.id + '-' + tripId;
};

Fleet.prototype.getPriceAndDistance = function(trip) {
  return maptools
    .getRoute(trip.pickupLocation, trip.dropoffLocation)
    .bind(this)
    .then(function(route){
      return {
        distance: route.distance,
        price: this.baseCost + (route.distance * this.costPerMile)
      };
    });
};

Fleet.prototype.getPickupEta = function(trip) {
  var startLocation;
  var delay; 
  if(this.availableDrivers.length === 0) {
    startLocation = this.location;
    delay = this.expectedDelayWhenNoDriversAvailable;
  } else {
    startLocation = this.availableDrivers[0].location;
    delay = 0;
  }
  return maptools
    .getRoute(startLocation, trip.pickupLocation)
    .then(function(route){
      return route.duration + delay;
    });
};

module.exports.Fleet = Fleet;
module.exports.IFleet = IFleet;

