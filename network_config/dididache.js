module.exports = {
  tripthru: {
    token: 'wVufGWRpFDMfIWtATqhDOgXuiYvayHpKiGtYIWeQEiIdfkfsXc'
  },
  name: 'Didi Dache',
  clientId: 'dididache@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 1500,
  drivers: 100000,
  currencyCode: 'HKD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/dididache@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  simulationType: 'tripthru',
  endpointType: 'socket',
  coverage: [
       {city: 'Peking', businessPercentage: 98},
       {city: 'Hong Kong', businessPercentage: 2}
   ]
};