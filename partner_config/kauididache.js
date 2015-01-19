module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenKauidiDache'
  },
  name: 'KauidiDache',
  clientId: 'kauididache@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 20800,
  drivers: 90000,
  coverage: [
       {city: 'Peking', businessPercentage: 97},
       {city: 'Hong Kong', businessPercentage: 2.5},
       {city: 'Singapore', businessPercentage: 0.5}
   ]
};