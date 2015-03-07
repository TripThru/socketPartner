module.exports = {
  tripthru: {
    token: 'VRggGsLlmyXWWmUiYHUOZJNlevbuudjVNvzKCQmKbOsiWjbnmp'
  },
  name: 'Curb',
  clientId: 'curb@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 400,
  drivers: 3500,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/curb@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Atlanta', businessPercentage: 2},
       {city: 'Boston', businessPercentage: 2},
       {city: 'Chicago', businessPercentage: 14},
       {city: 'Los Angeles', businessPercentage: 20},
       {city: 'New York', businessPercentage: 31},
       {city: 'San Francisco', businessPercentage: 12},
       {city: 'Washington', businessPercentage: 7},
       {city: 'Phoenix', businessPercentage: 12}
   ] 
};