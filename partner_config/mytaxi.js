module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenmyTaxi'
  },
  name: 'myTaxi',
  clientId: 'mytaxi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 420,
  drivers: 5000,
  coverage: [
       {city: 'Vienna', businessPercentage: 5},
       {city: 'Berlin', businessPercentage: 75},
       {city: 'Warsaw', businessPercentage: 5},
       {city: 'Barcelona', businessPercentage: 5},
       {city: 'Madrid', businessPercentage: 5},
       {city: 'Washington', businessPercentage: 5}
   ] 
};