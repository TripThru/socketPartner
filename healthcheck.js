var memwatch = require('memwatch');
/*
var agent = require('webkit-devtools-agent');
agent.start({
  port: 9999,
  bind_to: '0.0.0.0',
  ipc_port: 3333,
  verbose: true
});
*/
memwatch.on('leak', function(info) { 
  console.log('### Memwatch leak: ', info);
});

memwatch.on('stats', function(stats) { 
  var hd = new memwatch.HeapDiff();
  console.log('### Memwatch stats: ', stats);
  var diff = hd.end();
  console.log('### Memwatch diff: ', diff);
  console.log('### Details ', diff.change.details);
});