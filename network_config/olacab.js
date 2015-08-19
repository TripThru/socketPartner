module.exports = {
  tripthru: {
    token: 'JJqQjrwXzxXoBsiGQTRAajRyYmLdyvVSwUgtfauCuXqOhFbFfg'
  },
  name: 'Ola',
  clientId: 'olacab@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 250,
  drivers: 900,
  currencyCode: 'CAD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/olacab@tripthru.com.png',
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