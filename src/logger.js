function Logger(){
  
}

Logger.prototype.beginLog = function(id, message, object) {
  console.log(id, ': ', message);
};

Logger.prototype.log = function(id, message) {
  console.log(id, ': ', message);
};

Logger.prototype.endLog = function(id, message, object) {
  console.log(id, ': ', message);
};

module.exports = new Logger();