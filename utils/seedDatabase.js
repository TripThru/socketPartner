var store = require('../src/store');
var fs = require('fs');


function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var files = fs.readdirSync('../network_config/');
for(var i = 0; i < files.length; i++) {
  if(endsWith(files[i].toString(), '.js')) {
    var network = require('../network_config/' + files[i]);
    console.log('Creating ' + network.name + '...');
    store.createUser({
      id: network.name.toLowerCase() + '@tripthru.com',
      name: network.name,
      token: network.tripthru.token
    });
  }
}
console.log('Done');