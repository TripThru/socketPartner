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
  originatingNetwork: { 
    id: { type: String, trim: true },
    name: String
  },
  servicingNetwork: { 
    id: { type: String, trim: true },
    name: String
  },
  product: { 
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


 var quoteResponseSchema = {
      network: {
        id: { type: String, trim: true },
        name: String
      },
      product: {
        id: { type: String, trim: true },
        name: String
      },
      driver: {
        id: { type: String, trim: true },
        name: String
      },
      passenger: {
        id: { type: String, trim: true },
        name: String
      },
      eta: Date,
      vehicleType: { type: String, enum: common.vehicleTypes },
      price: Number,
      distance: Number,
      duration: Number
    };
  
var quote = new mongoose.Schema({
    id: { type: String, trim: true, required: true },
    state: { type: String, enum: common.quoteState },
    receivedQuotes: [quoteResponseSchema],
    autoDispatch: Boolean
  });

var user = new mongoose.Schema({
  id: { type: String, trim: true, required: true },
  name: { type: String, trim: true, required: true },
  token: { type: String, trim: true, required: true }
});

module.exports = {
    route: route,
    trip: trip,
    quote: quote,
    user: user
};