module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenCurb'
  },
  name: 'Curb',
  clientId: 'curb@tripthru.com',
  simulationInterval: 10,
  tripsPerHour: 290,
  drivers: 3500,
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