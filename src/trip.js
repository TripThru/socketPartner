var logger = require('./logger');
var maptools = require('./map_tools').MapTools;
var moment = require('moment');

function Trip(config) {
  
  if(!config.id) {
    throw new Error('Id is required');
  }
  if(!config.product) {
    throw new Error('Product is required');
  }
  if(!config.origination) {
    throw new Error('Origination is required');
  }
  if(!config.pickupLocation) {
    throw new Error('Pickup location is required');
  }
  if(!config.pickupTime) {
    throw new Error('Pickup time is required');
  }
  if(!config.dropoffLocation) {
    throw new Error('Dropoff location is required');
  }
  if(!config.customer) {
    throw new Error('Passenger is required');
  }
  
  
  this.id = config.id;
  this.publicId = config.product.generateTripPublicId(config.id);
  this.idNumber = config.idNumber;
  this.product = config.product;
  this.network = config.product.network;
  this.status = 'new';
  this.driver = config.driver;
  this.customer = config.customer;
  this.origination = config.origination;
  this.service = 'local';
  this.luggage = null;
  this.persons = null;
  this.pickupLocation = config.pickupLocation;
  this.pickupTime = config.pickupTime;
  this.dropoffLocation = config.dropoffLocation;
  this.dropoffTime = config.dropoffTime;
  this.waypoints = config.waypoints;
  this.paymentMethod = config.paymentMethod || 'cash';
  this.vehicleType = config.vehicleType || 'sedan';
  this.fare = config.fare || 0;
  this.maxFare = config.maxFare || 0;
  this.minRating = config.minRating || 0;
  this.autoDispatch = config.autoDispatch === false ? false : true;
  this.lastUpdate = null;
  this.eta = null;
  this.distance = 0;
  this.duration = moment.duration(0, 'seconds');
  this.lastStatusNotifiedToNetwork = null;
  this.lastDispatchAttempt = null;
}

Trip.prototype.statusHasChanged = function(status, driverLocation, eta) {
  var statusChanged = false;
  if(this.status !== status) {
    statusChanged = true;
  } else if(driverLocation) {
    if(!this.driver || !this.driver.location) {
      statusChanged = true;
    } else if(maptools.locationsAreEqual(driverLocation, this.driver.location)) {
      statusChanged = true;
    }
  } else if(eta){
    if(!this.eta) {
      statusChanged = true;
    } else if(!this.eta.isSame(eta)) {
      statusChanged = true;
    }
  }
  return statusChanged;
};

Trip.prototype.updateStatus = function(notifyNetwork, status, driverLocation, eta, distanceToNextPoint, durationToNextPoint) {
  var promiseToUpdate = Promise.resolve();
  if(this.statusHasChanged(status, driverLocation, eta)) {
    logger.log(this.id, 'Status has changed from ' + this.status + ' to ' +
        status + '. Driver location: ' + (driverLocation ? driverLocation.id : ''));
    if(!this.isActive()) {
      logger.log(this.id, 'Cannot set status: trip is not active');
      return promiseToUpdate;
    }

    this.eta = eta || this.eta;
    this.status = status;
    if(driverLocation) {
      this.updateDriverLocation(driverLocation);
    }
    if(distanceToNextPoint >= 0) { 
      this.distance += distanceToNextPoint;
    }
    if(durationToNextPoint) {
      this.duration.add(durationToNextPoint);
    }
    switch(status) {
      case 'completed':
        logger.log(this.id, 'Trip completed, deactivating');
        promiseToUpdate = 
          promiseToUpdate
            .bind(this)
            .then(function(){
              return this
                .product
                .getFareAndDistance(this)
                .bind(this)
                .then(function(result){
                  this.fare = result.fare;
                });
            });
          
        this.network.deactivateTrip(this, status);
        break;
      case 'rejected':
      case 'cancelled':
        /*if(this.origination === 'foreign' ||  this.product.missedPeriodReached(this)) {
          logger.log(this.id, 'Missed period reached or trip is foreign so deactivating');
          this.network.deactivateTrip(this, status);
          notifyNetwork = true;
        } else {
          logger.log(this.id, 'Missed period not reached yet so putting trip back to queue');
          this.status = 'queued';
          this.service = 'local';
        }*/
        if(this.origination === 'foreign') {
          this.network.deactivateTrip(this, status);
        }
        break;
    }
    if(this.lastStatusNotifiedToNetwork !== status && notifyNetwork) {
      promiseToUpdate = 
        promiseToUpdate
          .bind(this)
          .then(function(){
            return this
              .notifyForeignNetwork()
              .bind(this)
              .then(function(){
                this.lastStatusNotifiedToNetwork = status;
              });
          });
    }
  }
  return promiseToUpdate;
};

Trip.prototype.updateDriverLocation = function(location) {
  if(!this.driver) this.driver = {};
  this.driver.location = location;
  if(!this.driver.initalLocation) {
    this.driver.initialLocation = location;
  }
};

Trip.prototype.isActive = function() {
  return this.network.activeTripsByPublicId.hasOwnProperty(this.publicId);
};

Trip.prototype.notifyForeignNetwork = function() {
  logger.log(this.id, 'Since has foreign dependency, notify TripThru');
  return this.network.updateForeignNetwork(this);
};

Trip.prototype.hasForeignDependency = function() {
  return this.origination === 'foreign' || this.service === 'foreign';
};

module.exports.Trip = Trip;

