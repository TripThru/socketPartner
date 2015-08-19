module.exports = {
  tripthru: {
    token: 'kkhefBZgTJLgZIcwuqAimKDIpmtGaUiHffpTCQsPlSqqVJSnkW'
  },
  name: 'Hailo',
  clientId: 'hailo@tripthru.com',
  endpointType: 'socket',
  simulationInterval: 10,
  tripsPerHour: 400,
  drivers: 10000,
  currencyCode: 'GBP',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/hailo@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  simulationType: 'tripthru',
  coverage: [
     { city: 'London', businessPercentage: 32 },
     { city: 'Manchester',  businessPercentage: 10 },
     { city: 'Dublin', businessPercentage: 32 },
     { city: 'Osaka', businessPercentage: 2 },
     { city: 'Tokyo', businessPercentage: 3 },
     { city: 'Singapore', businessPercentage: 2 },
     { city: 'Barcelona', businessPercentage: 10 },
     { city: 'Madrid', businessPercentage: 9 }
  ]
};