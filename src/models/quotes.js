var store = require('../store');
var moment = require('moment');

function cloneQuote(quote) {
  var qt = {
      id: quote.id,
      state: quote.state,
      receivedQuotes: []
  };
  for(var i = 0; i < quote.receivedQuotes.length; i++) {
    var q = quote.receivedQuotes[i];
    var rq = {
      network: q.network,
      product: q.product,
      eta: q.eta,
      vehicleType: q.vehicleType,
      price: q.price,
      distance: q.distance,
      duration: q.duration
    };
    if(q.driver) rq.driver = q.request.driver;
    if(q.passenger) rq.driver = q.request.driver;
    qt.receivedQuotes.push(rq);
  }
  return qt;
}

function toStoreQuote(apiQuote) {
  var quote = cloneQuote(apiQuote);
  for(var i = 0; i < quote.receivedQuotes.length; i++) {
    var q = quote.receivedQuotes[i];
    q.eta = q.eta.toDate();
    if(q.duration) q.duration = q.duration.asSeconds();
  }
  return quote;
}

function toApiQuote(storeQuote) {
  var quote = cloneQuote(storeQuote);
  for(var i = 0; i < quote.receivedQuotes.length; i++) {
    var q = quote.receivedQuotes[i];
    q.eta = moment(q.eta);
    if(q.duration) q.duration = moment.duration(q.duration, 'seconds');
  }
  return quote;
}

var self = module.exports = {
  add: function(quote) {
    quote.state = 'inProgress'; //This should be done in a Quote constructor
    return store
      .createQuote(toStoreQuote(quote))
      .error(function(err){
        console.log('Error ocurred adding quote ' + err);
        throw new Error('Error ocurred adding quote ' + err);
      });
  },
  update: function(quote) {
    return store
      .updateQuote(toStoreQuote(quote))
      .error(function(err){
        console.log('Error ocurred updating quote ' + err);
        throw new Error('Error ocurred updating quote ' + err);
      });
  },
  getById: function(quoteId) {
    return store
      .getQuoteBy({id: quoteId})
      .then(function(res){
        return res.length > 0 ? toApiQuote(res[0].toObject()) : null;
      })
      .error(function(err){
        console.log('Error ocurred getting quote ' + err);
        throw new Error('Error ocurred getting quote ' + err);
      });
  }
};
