module.exports = {
  tripthru: {
    url: 'http://107.170.220.160/',
    token: 'tokenCabify'
  },
  name: 'Cabify',
  clientId: 'cabify@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 100,
  drivers: 2000,
  coverage: [
       {city: 'Santiago', businessPercentage: 19},
       {city: 'Rome', businessPercentage: 1},
       {city: 'Mexico City', businessPercentage: 20},
       {city: 'Lima', businessPercentage: 20},
       {city: 'Barcelona', businessPercentage: 20},
       {city: 'Madrid', businessPercentage: 19},
       {city: 'Valencia', businessPercentage: 1}
   ] 
};