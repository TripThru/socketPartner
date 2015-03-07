module.exports = {
  tripthru: {
    token: 'loGvUopbflybTDhEoiNiVbBBRMNToNPHJJSKjjpTGzrfSMQAZD'
  },
  name: 'GrabTaxi',
  clientId: 'grabtaxi@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 400,
  drivers: 4000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/grabtaxi@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Johor Bahru', businessPercentage: 0.1},
       {city: 'Kuala Lumpur', businessPercentage: 6},
       {city: 'Kuching', businessPercentage: 1},
       {city: 'Malaca', businessPercentage: 1},
       {city: 'George Town', businessPercentage: 1},
       {city: 'Ipoh', businessPercentage: 3},
       {city: 'Cebu', businessPercentage: 1},
       {city: 'Davao', businessPercentage: 1},
       {city: 'Manila', businessPercentage: 14},
       {city: 'Singapore', businessPercentage: 50},
       {city: 'Taipei', businessPercentage: 1},
       {city: 'Bangkok', businessPercentage: 13},
       {city: 'Nonthaburi', businessPercentage: 1},
       {city: 'Hanoi', businessPercentage: 1},
       {city: 'Ho Chi Minh', businessPercentage: 6}
   ] 
};