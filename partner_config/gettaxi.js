module.exports = {
  tripthru: {
    url: 'http://107.170.220.160/',
    token: 'tokenGetTaxi'
  },
  name: 'GetTaxi',
  clientId: 'gettaxi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 250,
  drivers: 7000,
  coverage: [
       {city: 'Vienna', businessPercentage: 2},
       {city: 'London', businessPercentage: 25},
       {city: 'Manchester', businessPercentage: 2},
       {city: 'Paris', businessPercentage: 4},
       {city: 'Berlin', businessPercentage: 5},
       {city: 'Jerusalem', businessPercentage: 10},
       {city: 'Moscow', businessPercentage: 25},
       {city: 'Barcelona', businessPercentage: 1},
       {city: 'Madrid', businessPercentage: 1},
       {city: 'New York', businessPercentage: 25}
   ] 
};