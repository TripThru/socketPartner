module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenHubai'
  },
  name: 'Hubai Taxi Corporation',
  clientId: 'hubai@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'Hubai Taxi Corporation',
    name: 'Hubai Taxi Corporation',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 25.271139,
        lng: 55.307485
      },
      radius: 50
    },
    location: {
      lat: 25.271139,
      lng: 55.307485
    },
    vehicleTypes: [
       'compact',
       'sedan'
    ],
    drivers: [
      'Hussean Widobe',
      'Omar Sharief',
      'Sheikh Hamdan',
      'Mohammed Hamdan',
      'Rashid Al Maktoum',
      'Hamdan Widobe',
      'Ayishah Janan Halabi',
      'Hayud Munirah Sarkis',
      'Asra Salwa Nazari',
      'Hilel Sahl Harb',
      'Jala Nahid Ba',
      'Bahiya Baheera Kassis',
      'Azhar Amro Saliba',
      'Kawakib Walidah Sarraf',
      'Khaldoon Harun Safar',
      'Aliyah Shahirah Nassar',
      'Muta Abdul Awad',
      'Fakhir Anbar Guirguis',
      'Khuzama Maysa Srour',
      'Sanaa Malakah Ganim',
      'Jeannine Loyola',
      'Jacquelyn Folts',
      'Benton Aguila',
      'Hisako Peake',
      'Earlie Tapia',
      'Gino Kampf',
      'Temika Snipe',
      'Rena Dedrick',
      'Angele Stoffel',
      'Leonor Chesson'
    ],
    passengers: [
      'Sheikh Hamdan Bin Mohammed bin Rashid Al Maktoum'
    ],
    possibleTrips: [
      {
        start: { lat: 25.270751, lng: 55.31403 },
        end: {  lat: 25.279288, lng: 55.304331 }
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
        start: { lat: 26.137129, lng: -80.113431 },
        end: { lat: 26.122976, lng: -80.10474 }
      },
      {
        start: { lat: 25.845224, lng: -80.119744 },
        end: { lat: 25.7950665, lng: -80.2786931 }
      }
    ]
  }]
};