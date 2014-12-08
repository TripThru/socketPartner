var Promise = require('bluebird');
var PromiseHelper = require('./promise_helper');

function subtask(){
  return Promise.Promise.resolve();
}

function simulate(num){
  console.log(this);
  console.log('task ' + num);
  return subtask()
    .then(function(){
        console.log('subtask ' + num);
    });
}

function run() {
  return PromiseHelper
    .runInSequence([1, 2, 3], simulate.bind({x: 3}))
    .then(function(){
      console.log('resolved');
    });
}

function start() {
  run().then(setTimeout(start, 3000));
}

start();
