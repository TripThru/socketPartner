module.exports = {
  tripthru: {
    token: 'cbscKarVvyIikysRGdSdqfHEneIjtydPhMHhPgMVkujPECfqYf'
  },
  name: 'TaxiPixi',
  clientId: 'taxipixi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 40,
  drivers: 200,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/taxipixi@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  simulationType: 'tripthru',
  endpointType: 'socket',
  coverage: [
       {city: 'Bombay', businessPercentage: 100}
   ] 
};