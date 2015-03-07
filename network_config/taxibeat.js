module.exports = {
  tripthru: {
    token: 'jDpYwXuijVLEwVcwymhtTdliZKUCkLIRaFYskqBaGPnpUFVCKT'
  },
  name: 'TaxiBeat',
  clientId: 'taxibeat@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 120,
  drivers: 2000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/taxibeat@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Brasilia', businessPercentage: 20},
       {city: 'Paris', businessPercentage: 20},
       {city: 'Athens', businessPercentage: 20},
       {city: 'Mexico City', businessPercentage: 20},
       {city: 'Oslo', businessPercentage: 10},
       {city: 'Bucharest', businessPercentage: 10}
   ] 
};