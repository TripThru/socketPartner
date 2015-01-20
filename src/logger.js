var moment = require('moment');

function Logger(){
  
}

Logger.prototype.beginLog = function(id, message, object) {
  console.log(moment().utc().toDate().toISOString(), '-', id, ': ', message);
};

Logger.prototype.log = function(id, message) {
  console.log(moment().utc().toDate().toISOString(), '-', id, ': ', message);
};

Logger.prototype.endLog = function(id, message, object) {
  console.log(moment().utc().toDate().toISOString(), '-', id, ': ', message);
};

module.exports = new Logger();