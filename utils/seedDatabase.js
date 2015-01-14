var store = require('../src/store');
var fs = require('fs');


function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var files = fs.readdirSync('../partner_config/');
for(var i = 0; i < files.length; i++) {
  if(endsWith(files[i].toString(), '.js')) {
    var partner = require('../partner_config/' + files[i]);
    store.createUser({
      id: partner.name.toLowerCase() + '@tripthru.com',
      name: partner.name,
      token: partner.tripthru.token
    });
  }
}