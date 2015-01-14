module.exports = {
  tripthru: {
    url: 'http://107.170.220.160/',
    token: 'tokenHailo'
  },
  name: 'Hailo',
  clientId: 'hailo@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 210,
  drivers: 10000,
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