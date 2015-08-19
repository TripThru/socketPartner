var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var logger = require('./src/logger');
var codes = require('./src/codes');
var resultCodes = codes.resultCodes;

var app = express();
app.set('port', config.expressPort);
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
      var root = '/' + name;
      app.get(root + '/network/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .getNetworkInfo(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.get(root + '/drivers', function(req, res){
        network
          .getDriversNearby(req.body)
          .then(function(response){
            res.json(response);
          });
      });
      app.get(root + '/quote/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .getQuote(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.post(root + '/trip/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .dispatchTrip(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.put(root + '/tripstatus/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .updateTripStatus(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.get(root + '/tripstatus/:id', function(req, res){
        var request = {
            id: req.params.id
        };
        network
          .getTripStatus(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.post(root + '/payment/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .requestPayment(request)
          .then(function(response){
            res.json(response);
          });
      });
      app.put(root + '/payment/:id', function(req, res){
        var request = req.body;
        request.id = req.params.id;
        network
          .acceptPayment(request)
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
