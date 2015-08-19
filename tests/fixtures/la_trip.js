var trips = require('../../network_config/data/tripsByCity');
var moment = require('moment');

module.exports = {
	customer: {
		id: 'TestCustomer',
		name: 'TestCustomer'
	},
	pickupTime: moment(),
	from: trips['Los Angeles'][0].start,
	to: trips['Los Angeles'][0].end
};