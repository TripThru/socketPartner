module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenTaxiBeat'
  },
  name: 'TaxiBeat',
  clientId: 'taxibeat@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 60,
  drivers: 2000,
  coverage: [
       {city: 'Brasilia', businessPercentage: 20},
       {city: 'Paris', businessPercentage: 20},
       {city: 'Athens', businessPercentage: 20},
       {city: 'Mexico City', businessPercentage: 20},
       {city: 'Oslo', businessPercentage: 10},
       {city: 'Bucharest', businessPercentage: 10}
   ] 
};