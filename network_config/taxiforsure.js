module.exports = {
  tripthru: {
    token: 'rNtHlvYnalGHtGOiSGpuAomzoPjbOqvdowrTeyLyHZGqSKnCHX'
  },
  name: 'TaxiForSure',
  clientId: 'taxiforsure@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 160,
  drivers: 4000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/taxiforsure@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Bombay', businessPercentage: 100}
   ] 
};