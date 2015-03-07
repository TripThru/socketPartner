module.exports = {
  tripthru: {
    token: 'PyrNjMjuDxDvgCtwshGgvfzjJIiNotdRdxyoKhZGMusIMAMwKT'
  },
  name: 'Cabify',
  clientId: 'cabify@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 400,
  drivers: 2000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/cabify@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  coverage: [
       {city: 'Santiago', businessPercentage: 19},
       {city: 'Rome', businessPercentage: 1},
       {city: 'Mexico City', businessPercentage: 20},
       {city: 'Lima', businessPercentage: 20},
       {city: 'Barcelona', businessPercentage: 20},
       {city: 'Madrid', businessPercentage: 19},
       {city: 'Valencia', businessPercentage: 1}
   ] 
};