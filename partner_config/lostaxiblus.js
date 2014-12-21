module.exports = {
  tripthru: {
    url: 'http://localhost:3300/',
    token: 'tokenLostaxiblus'
  },
  name: 'Los Taxi Blus',
  clientId: 'lostaxiblus@tripthru.com',
  simulationInterval: 10,
  fleets: [{
    id: 'Los Taxi Blus',
    name: 'Los Taxi Blus',
    baseCost: 3,
    costPerMile: 3,
    tripsPerHour: 400,
    maxActiveTrips: 30,
    coverage: {
      center: {
        lat: 48.837246,
        lng: 2.347844
      },
      radius: 50
    },
    location: {
      lat: 48.837246,
      lng: 2.347844
    },
    vehicleTypes: [
       'compact',
       'sedan'
    ],
    drivers: [
      'Slyvian Reubele',
      'Wassem Mohammed',
      'Rhodri Cnaeus',
      'Tigernach Ouri',
      'Jaylin Phoebus',
      'Sandy Omar',
      'Noga Fintan',
      'Hamilton Labrosse',
      'Corette Labelle',
      'Leal Caisse',
      'Tristan Laderoute',
      'Gauthier Dionne',
      'France Migneault',
      'Eugenia Fortin',
      'Matilda LAnglais',
      'Jolie Boivin',
      'Maurice Lajeunesse',
      'Eleanor Busque',
      'Duane Garth',
      'Gala Ciesielski',
      'Tomi Boring',
      'Lynda Scherer',
      'Deetta Goya',
      'Alexia Schiel',
      'Tynisha Pharris',
      'Nan Newland',
      'Lelia Marlar',
      'Dwana Mckie'
    ],
    passengers: [
      'Daniel Corona'
    ],
    possibleTrips: [
      {
        start : { lat : 37.784345, lng : -122.422922 },
        end   : { lat : 37.785292, lng : -122.416257 }
      },
      {
        start : { lat : 48.835975, lng : 2.345097 },
        end   : { lat : 48.837275, lng : 2.382433 }
      },
      {
        start : { lat : 37.800224, lng : -122.43352 },
        end   : { lat : 37.800066, lng : -122.436167 }
      },
      {
        start : { lat : 42.342634, lng : -71.122545 },
        end   : { lat : 42.367561, lng : -71.129498 }
      },
      {
        start : { lat : 25.270751, lng : 55.314030 },
        end   : { lat : 25.279288, lng : 55.304331 }
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