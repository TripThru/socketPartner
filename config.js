module.exports = {
  expressPort: 3303,
  expressUrl: 'http://localhost:3301/',
  bookingsPort: 3304,
  tripthru: {
    url: 'http://localhost:3300/',
    cert: './tripthru_client.crt',
    key: './tripthru_client.key',
    passphrase: 'tripthru',
    secureConnection: false
  },
  db: {
    url: 'mongodb://localhost:27017/partners',
    user: '',
    password: ''
  }
};