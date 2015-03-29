var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var logger = require('./src/logger');
var codes = require('./src/codes');
var resultCodes = codes.resultCodes;

var app = express();
app.set('port', process.env.PORT || config.port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Method", "GET,PUT,POST,DELETE,HEAD,OPTIONS");
  next();
});

function init(networksById) { 
  for(var id in networksById) {
    (function(id){
      var name = networksById[id].name.replace(/ /g, '');
      var network = networksById[id];
      app.post('/' + name + '/quote', function(req, res){   
        var request = req.body;
        network
          .bookingsQuoteTrip(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.post('/' + name + '/drivers', function(req, res) {
        var request = req.body;
        network
          .bookingsGetDriversNearby(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.post('/' + name + '/trip',  function(req, res){
        var request = req.body;
        network
          .bookingsDispatchTrip(request)
          .then(function(response){
            res.json(response);
          });
      }); 
      app.get('/' + name + '/tripstatus/:tripId', function(req, res) {
        var request = { id: req.params.tripId };
        network
          .bookingsGetTripStatus(request)
          .then(function(response){
            res.json(response);
          });
      });
    })(id);
  }
  
  app.listen(app.get('port'), function (){
    console.log("server listening on port " + app.get('port'));
  });
}

module.exports.init = init;
