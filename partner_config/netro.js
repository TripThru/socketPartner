module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenNetro'
  },
  name: 'Netro',
  clientId: 'netro@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'Netro',
    name: 'Netro',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 42.356217,
        lng: -71.137512
      },
      radius: 50
    },
    location: {
      lat: 42.356217,
      lng: -71.137512
    },
    vehicleTypes: [
       'compact',
       'sedan'
    ],
    drivers: [
      'Joanna Glennon',
      'Ofer Matan',
      'Ignas Thucydides',
      'Clyde Hariwini',
      'Flavio Ragnvald',
      'Kenaniah Sergei',
      'Ezra Adilet',
      'David S. Chatman',
      'Lilly A. Sabala',
      'Jesus S. Jackson',
      'Martha R. Martin',
      'Donald G. Lillibridge',
      'Clara B. Cantu',
      'Michael P. Ruiz',
      'Leland R. Elmore',
      'Chris P. Gardner',
      'Dessie R. Rivera',
      'Kathy L. Griffin',
      'Christopher B. Bell',
      'Lacie Ridgell',
      'Leonard Fife',
      'Ross Dohrmann',
      'Elliott Garvin',
      'Sharmaine Grave',
      'Nydia Empey',
      'Luana Buchan',
      'Jerri Christine',
      'Inger Merck',
      'Maryellen Legrand'
    ],
    passengers: [
      'Michael Glennon',
      'William Glennon',
      'Bernice Hamilton'
    ],
    possibleTrips: [
      {
        start: { lat: 37.782551, lng: -122.445368 },
        end: { lat: 37.786956, lng: -122.440279 }
      },
      {
        start: { lat: 37.784345, lng: -122.422922 },
        end: { lat: 37.785292, lng: -122.416257 }
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
        start: { lat: 42.342634, lng: -71.122545 },
        end: { lat: 42.367561, lng: -71.129498 }
      },
      {
        start: { lat: 26.1196017, lng: -80.1429035 },
        end: { lat: 25.7950665, lng: -80.2786931 }
      }
    ]
  }]
};