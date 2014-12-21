module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenNytaxi'
  },
  name: 'NY Taxi',
  clientId: 'nytaxi@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'NY Taxi',
    name: 'NY Taxi',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 40.769004,
        lng: -73.981376
      },
      radius: 50
    },
    location: {
      lat: 40.769004,
      lng: -73.981376
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
      'Isidra Bitter',
      'Jacquelin A Sullivan',
      'Gail P Gray',
      'Jaime P Baird',
      'Victor N Brand',
      'Florence T Schofield',
      'John C Volkert',
      'Hosea A Marvin',
      'Jane C Wang',
      'Leonard R Giles',
      'Christopher A Guzman',
      'Deborah J Walker',
      'Jeffrey T Bennett',
      'Jo M Walker',
      'Craig E Munoz',
      'James A Reliford',
      'Ron N Sowers',
      'Lorraine C Andrews',
      'Laura D Peterson',
      'Deborah T Goodman',
      'Ann S Oliver',
      'Gregory M Norris',
      'Steven M Farrell',
      'Patricia C Greer',
      'Alicia J Shaw',
      'Dorothy T Pinner',
      'Lelia R Shay',
      'Regina D Downs',
      'Benjamin D Sutton',
      'Tammy D Jones',
      'William N Rodriguez',
      'Donna E Hendrix',
      'William C Bouchard',
      'Elizabeth J Teasley',
      'Israel V Norton',
      'Raymond L Bridges',
      'Veronica D Cruz',
      'John D Hoch',
      'Griselda B Barraza',
      'Connie M Smith',
      'Stephanie B Rutherford',
      'Edward M Carter',
      'Linda B Bates',
      'Marguerite P Walters',
      'Gavin D Shell',
      'Meghan R Vail',
      'Fran C Perkins'
    ],
    passengers: [
      'Patrick Hughe'
    ],
    possibleTrips: [
      {
        start: { lat: 25.270751, lng: 55.31403 },
        end: { lat: 25.279288, lng: 55.304331 }
      },
      {
        start: { lat: 42.342634, lng: -71.122545 },
        end: { lat: 42.367561, lng: -71.129498 }
      },
      {
        start: { lat: 37.800224, lng: -122.43352 },
        end: { lat: 37.800066, lng: -122.436167 }
      },
      {
        start: { lat: 48.835975, lng: 2.345097 },
        end: { lat: 48.837275, lng: 2.382433 }
      },
      {
        start: { lat: 37.782551, lng: -122.445368 },
        end: { lat: 37.786956, lng: -122.440279 }
      },
      {
        start: { lat: 40.7650963, lng: -73.9751487 },
        end: { lat: 40.727227, lng: -74.003911 }
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