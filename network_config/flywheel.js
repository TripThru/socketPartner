module.exports = {
  tripthru: {
    token: 'ikxMKOugDCOlOShWuXePxdRFIpfUpBWNoPSMHGbsVMTRADBdpD'
  },
  name: 'FlyWheel',
  clientId: 'flywheel@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 250,
  drivers: 7000,
  currencyCode: 'USD',
  capacity: 2000,
  imageUrl: 'http://www.tripthru.com/assets/networks/flywheel@tripthru.com.png',
  acceptsPrescheduled: true,
  acceptsOndemand: true,
  acceptsCashPayment: true,
  acceptsAccountPayment: true,
  acceptsCreditcardPayment: true,
  simulationType: 'tripthru',
  endpointType: 'socket',
  coverage: [
       {city: 'Chicago', businessPercentage: 25},
       {city: 'Los Angeles', businessPercentage: 30},
       {city: 'San Francisco', businessPercentage: 40},
       {city: 'Phoenix', businessPercentage: 5}
   ] 
};