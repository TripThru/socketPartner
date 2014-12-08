var mongoose = require("mongoose");
var common = require("./common");

var location = {
    lat: Number,
    lng: Number
};

var waypoint = {
  lat: Number,
  lng: Number,
  elapse: Number,
  distance: Number
};

var route = new mongoose.Schema({
  id: { type: String, trim: true, required: true },
  waypoints: [waypoint]
});

var trip = new mongoose.Schema({
  id: { type: String, trim: true, required: true },
  originatingPartner: { 
    id: { type: String, trim: true },
    name: String
  },
  servicingPartner: { 
    id: { type: String, trim: true },
    name: String
  },
  fleet: { 
    id: { type: String, trim: true },
    name: String
  },
  driver: { 
    id: { type: String, trim: true },
    name: String,
    location: location,
    initalLocation: location
  },
  passenger: { 
    id: { type: String, trim: true },
    name: String
  },
  pickupLocation: location,
  pickupTime: Date,
  dropoffLocation: location,
  dropoffTime: Date,
  vehicleType: { type: String, enum: common.vehicleTypes },
  paymentMethod: { type: String, enum: common.paymentMethods },
  price: { type: Number, min: 0 },
  status: { type: String, enum: common.tripStatus },
  eta: Date,
  creation: Date,
  lastUpdate: Date,
  state: { type: String, enum: common.tripState }
});

module.exports = {
    route: route,
    trip: trip
};