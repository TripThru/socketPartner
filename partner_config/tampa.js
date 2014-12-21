module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenTampa'
  },
  name: 'Tampa',
  clientId: 'tampa@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'Tampa',
    name: 'Tampa',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 26.1275183,
        lng: -80.103452
      },
      radius: 50
    },
    location: {
      lat: 26.1275183,
      lng: -80.103452
    },
    vehicleTypes: [
       'compact',
       'sedan'
    ],
    drivers: [
      'Eduardo Lozano',
      'Edward Hamilton',
      'Steven Thompson',
      'Bartomeu Astor',
      'Matthias Randulf',
      'Ahoth Achab',
      'Mattias Ohannes',
      'Alta J. Johnson',
      'Joy B. Wright',
      'Joseph A. Bethel',
      'Rachael H. Hall',
      'Bernice R. Gooch',
      'Minerva C. Alton',
      'Shannon R. Turnipseed',
      'Herman E. Ackerman',
      'Michael D. Peters',
      'Kenneth M. Goss',
      'Barry C. Dumas',
      'Colleen G. McAllister',
      'Karina Huntsman',
      'Geoffrey Cuomo',
      'Alease Linz',
      'Arnetta Agin',
      'Gregorio Timmerman',
      'Garret Kadel',
      'Christy Coplin',
      'Elias Alphin',
      'Ossie Chesnut',
      'Eufemia Adelman',
      'Tesha Mcbain',
      'Bobette Leeder',
      'Ching Owenby',
      'Tonie Millikin',
      'Tamatha Parsley',
      'Lawrence Soliman',
      'Palmira Rawlins',
      'Teresita Montesinos',
      'Robby Moses',
      'Roseanna Littlefield'
    ],
    passengers: [
      'Robert Bilson',
      'Jennifer Drew',
      'Andre Martinez',
      'Susan Rello',
      'David Elk',
      'Helen Sofer'
    ],
    possibleTrips: [
      {
        start: { lat: 42.342634, lng: -71.122545 },
        end: { lat: 42.367561, lng: -71.129498 }
      },
      {
        start: { lat: 37.782551, lng: -122.445368 },
        end: { lat: 37.786956, lng: -122.440279 }
      },
      {
        start: { lat: 48.835975, lng: 2.345097 },
        end: { lat: 48.837275, lng: 2.382433 }
      },
      {
        start: { lat: 25.270751, lng: 55.31403 },
        end: { lat: 25.279288, lng: 55.304331 }
      },
      {
        start: { lat: 37.784345, lng: -122.422922 },
        end: { lat: 37.785292, lng: -122.416257 }
      },
      {
        start: { lat: 26.122976, lng: -80.10474 },
        end: { lat: 26.1313537, lng: -80.1366433 }
      },
      {
        start: { lat: 25.845224, lng: -80.119744 },
        end: { lat: 25.7950665, lng: -80.2786931 }
      }
    ]
  }]
};