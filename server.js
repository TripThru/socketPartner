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

function init(partnersById) { 
  for(var id in partnersById) {
    (function(id){
      var name = partnersById[id].name.replace(/ /g, '');
      var partner = partnersById[id];
      app.post('/' + name + '/quote', function(req, res){   
        var request = req.body;
        partner.bookingsQuoteTrip(request, function(response){
          res.json(response);
        });
      });
      app.post('/' + name + '/trip',  function(req, res){
        var request = req.body;
        partner.bookingsDispatchTrip(request, function(response){
          res.json(response);
        });
      }); 
      app.get('/' + name + '/tripstatus/:tripId', function(req, res) {
        var request = { id: req.params.tripId };
        partner.bookingsGetTripStatus(request, function(response){
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
