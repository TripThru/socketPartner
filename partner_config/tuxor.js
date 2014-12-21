module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenTuxor'
  },
  name: 'Tuxor',
  clientId: 'tuxor@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'Tuxor',
    name: 'Tuxor',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 37.78906,
        lng: -122.402127
      },
      radius: 50
    },
    location: {
      lat: 37.78906,
      lng: -122.402127
    },
    vehicleTypes: [
       'compact',
       'sedan'
    ],
    drivers: [
      'Alex Goldman',
      'Jason Fama',
      'Simon Shvarts',
      'Bob Toni',
      'Velimir Erebos',
      'Maximillian Constantin',
      'Kimberly H. Kennedy',
      'Rodney M. Montgomery',
      'James B. Racine',
      'Patrick M. High',
      'Marcella A. Sova',
      'Maria K. Morrison',
      'Lisa M. Nicholson',
      'Edward P. Morton',
      'James A. Birt',
      'Margaret J. Kent',
      'Gladys L. Serrano',
      'Eddie J. Johnson',
      'Lynnette Queener',
      'Hulda Mckinnis',
      'Elicia Kuhlman',
      'Doug Vanwingerden',
      'Orval Aubert',
      'Zoraida Timpson',
      'Whitney Ables',
      'Tandy Aponte',
      'Janeen Aguilera',
      'Isidra Bitter'
    ],
    passengers: [
      'William Bosworth',
      'Karl Morgan',
      'Ramel Eigen',
      'Allen Ford',
      'Mary Jefferson',
      'Jason Loughlin'
    ],
    possibleTrips: [
      {
        start: { lat: 37.800224, lng: -122.43352 },
        end: { lat: 37.800066, lng: -122.436167 }
      },
      {
        start: { lat: 48.835975, lng: 2.345097 },
        end: { lat: 48.837275, lng: 2.382433 }
      },
      {
        start: { lat: 48.843545, lng: 2.385352 },
        end: { lat: 48.839478, lng: 2.317374 }
      },
      {
        start: { lat: 25.270751, lng: 55.31403 },
        end: { lat: 25.279288, lng: 55.304331 }
      },
      {
        start: { lat: -22.910194, lng: -43.212211 },
        end: { lat: -22.900311, lng: -43.240621 }
      },
      {
        start: { lat: 42.342634, lng: -71.122545 },
        end: { lat: 42.367561, lng: -71.129498 }
      },
      {
        start: { lat: 25.845224, lng: -80.119744 },
        end: { lat: 25.7950665, lng: -80.2786931 }
      },
      {
        start: { lat: 26.122976, lng: -80.10474 },
        end: { lat: 26.1313537, lng: -80.1366433 }
      }
    ]
  }]
};