module.exports = {
  tripthru: {
    token: 'lLWIHvBcnTpEinYJENuTlSVPjinmIiEVFOanSgJUQmeLlNiOEJ'
  },
  name: 'MyTaxi',
  clientId: 'mytaxi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 700,
  drivers: 5000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/mytaxi@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Vienna', businessPercentage: 5},
       {city: 'Berlin', businessPercentage: 75},
       {city: 'Warsaw', businessPercentage: 5},
       {city: 'Barcelona', businessPercentage: 5},
       {city: 'Madrid', businessPercentage: 5},
       {city: 'Washington', businessPercentage: 5}
   ] 
};