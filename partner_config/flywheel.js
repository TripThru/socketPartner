module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenFlyWheel'
  },
  name: 'FlyWheel',
  clientId: 'flywheel@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 125,
  drivers: 7000,
  coverage: [
       {city: 'Chicago', businessPercentage: 25},
       {city: 'Los Angeles', businessPercentage: 30},
       {city: 'San Francisco', businessPercentage: 40},
       {city: 'Phoenix', businessPercentage: 5}
   ] 
};