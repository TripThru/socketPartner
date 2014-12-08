var logger = require('./logger');
var maptools = require('./map_tools');

function Trip(config) {
  
  if(!config.id) {
    throw new Error('Id is required');
  }
  if(!config.idNumber) {
    throw new Error('Id number is required');
  }
  if(!config.fleet) {
    throw new Error('Fleet is required');
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
  if(!config.passenger) {
    throw new Error('Passenger is required');
  }
  
  
  this.id = config.id;
  this.publicId = config.fleet.generateTripPublicId(config.id);
  this.idNumber = config.idNumber;
  this.fleet = config.fleet;
  this.partner = config.fleet.partner;
  this.status = 'new';
  this.driver = config.driver;
  this.passenger = config.passenger;
  this.origination = config.origination;
  this.service = 'local';
  this.luggage = null;
  this.persons = null;
  this.pickupLocation = config.pickupLocation;
  this.pickupTime = config.pickupTime;
  this.duration = config.duration;
  this.dropoffLocation = config.dropoffLocation;
  this.dropoffTime = config.dropoffTime;
  this.waypoints = config.waypoints;
  this.paymentMethod = config.paymentMethod || 'cash';
  this.vehicleType = config.vehicleType || 'sedan';
  this.price = config.price || 0;
  this.maxPrice = config.maxPrice || 0;
  this.minRating = config.minRating || 0;
  this.autoDispatch = config.autoDispatch === false ? false : true;
  this.lastUpdate = null;
  this.eta = null;
  this.distance = null;
  this.lastStatusNotifiedToPartner = null;
  this.lastDispatchAttempt = null;
}

Trip.prototype.statusHasChanged = function(status, driverLocation, eta) {
  return this.status !== status || 
    maptools.locationsAreEqual(driverLocation, this.driver.location) ||
    !this.eta.isSame(eta);
};

Trip.prototype.updateStatus = function(notifyPartner, status, driverLocation, eta) {
  if(this.statusHasChanged(status, driverLocation, eta)) {
    logger.log(this.id, 'Status has changed from ' + this.status + ' to ' +
        status + '. Driver location: ' + (driverLocation ? driverLocation.id : ''));
    if(!this.isActive()) {
      logger.log(this.id, 'Cannot set status: trip is not active');
      return Promise.resolve();
    }

    this.eta = eta || this.eta;
    this.status = status;
    switch(status) {
      case 'complete':
        logger.log(this.id, 'Trip completed, deactivating');
        this.partner.deactivateTrip(this, status);
        break;
      case 'rejected':
      case 'cancelled':
        if(this.origination === 'foreign' && this.fleet.missedPeriodReached(this)) {
          logger.log(this.id, 'Missed period reached or trip is foreign so deactivating');
          this.partner.deactivateTrip(this, status);
        } else {
          logger.log(this.id, 'Missed period not reached yet so putting trip back to queue');
          this.status = 'queued';
          this.service = 'local';
        }
        break;
    }
    if(this.lastStatusNotifiedToPartner !== status && notifyPartner) {
      return this
        .notifyForeignPartner()
        .bind(this)
        .then(function(){
          this.lastStatusNotifiedToPartner = status;
        });
    }
    return Promise.resolve();
  }
};

Trip.prototype.updateDriverLocation = function(location) {
  this.driver.location = location;
  if(!this.driver.initalLocation) {
    this.driver.initialLocation = location;
  }
};

Trip.prototype.isActive = function() {
  return this.partner.activeTripsByPublicId.hasOwnProperty(this.publicId);
};

Trip.prototype.notifyForeignPartner = function() {
  logger.log(this.id, 'Since has foreign dependency, notify TripThru');
  return this.partner.updateForeignPartner(this);
};

Trip.prototype.hasForeignDependency = function() {
  return this.origination === 'foreign' || this.service === 'foreign';
};

module.exports.Trip = Trip;

