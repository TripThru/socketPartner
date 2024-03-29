module.exports = {
  tripthru: {
    token: 'CtCMTHCMeETfPcFeIcFBCOOcxhALdlxunwmXlpjKUKEkVythOQ'
  },
  name: 'GetTaxi',
  clientId: 'gettaxi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 500,
  drivers: 7000,
  currencyCode: 'EUR',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/gettaxi@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  simulationType: 'tripthru',
  endpointType: 'socket',
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