/**
 * @providesModule ReactWorker
 */

// evalInUI(), evalInWorker(), main()
// pass ID into renderComponent
// server rendering-esque mount from worker
// renderComponent() updates from worker (NOT full renders)
// setState() and reconcile in worker
// run event handlers in worker (whitelist? blacklist?)

var ExecutionEnvironment = require('ExecutionEnvironment');
var emptyFunction = require('emptyFunction');

var worker = null;

var callbackIDs = 0;
var callbacks = {};

// These are permanent
var functions = {};
var functionIDs = 0;

function registerFunction(func) {
  var key = 'func' + (functionIDs++);
  functions[key] = func;
  return key;
}

function getFunctionProxy(key, runsInUI) {
  return function() {
    var args = Array.prototype.slice.apply(arguments);
    var lastArg = args.length > 0 ? args[args.length - 1] : null;
    var callback = null;
    if (typeof lastArg === 'function') {
      // it's a callback
      callback = lastArg;
      args = args.slice(0, args.length - 1);
    }
    if (runsInUI) {
      callInUI(key, args, callback);
    } else {
      callInWorker(key, args, callback);
    }
  };
}

function runsInUI(func) {
  return getFunctionProxy(registerFunction(func), true);
}

function runsInWorker(func) {
  return getFunctionProxy(registerFunction(func), false);
}

function registerCallback(cb) {
  var key = 'cb' + (callbackIDs++);
  callbacks[key] = cb;
  return key;
}

function callInUI(key, args, cb) {
  cb = cb || emptyFunction;

  if (ExecutionEnvironment.canUseDOM) {
    var r;
    try {
      args.push(cb);
      functions[key].apply(null, args);
    } catch (e) {
      cb(null, e);
    }
    return;
  }
  self.postMessage(['call', [key, args], registerCallback(cb)]);
}

function callInWorker(key, args, cb) {
  cb = cb || emptyFunction;

  if (!ExecutionEnvironment.canUseDOM || !worker) {
    var r;
    try {
      args.push(cb);
      functions[key].apply(null, args);
    } catch (e) {
      cb(e);
    }
    return;
  }
  worker.postMessage(['call', [key, args], registerCallback(cb)]);
}

function handleMessage(msg, reply) {
  if (msg[0] === 'call') {
    var functionKey = msg[1][0];
    var args = msg[1][1];
    var cbKey = msg[2];
    args.push(function(value) {
      reply(['cb', cbKey, value]);
    });
    functions[functionKey].apply(null, args)
  } else if (msg[0] === 'cb') {
    callbacks[msg[1]](msg[2]);
    callbacks[msg[1]] = null;
  }
}

function initWorker(path) {
  worker = new Worker(path);
  worker.onmessage = function(event) {
    handleMessage(event.data, worker.postMessage.bind(worker));
  };
  worker.onerror = function(event) {
    console.error(event);
  };
}

var _consoleLog = runsInUI(function() {
  var args = Array.prototype.slice.call(arguments);
  args = ['WORKER:'].concat(args.slice(0, args.length - 1));
  console.log.apply(console, args);
});

function workerMain() {
  // webworker main
  self.console = {log: _consoleLog};
  self.onmessage = function(event) {
    handleMessage(event.data, self.postMessage.bind(self));
  };
}

if (ExecutionEnvironment.isInWorker) {
  // we are being used a a webworker
  workerMain();
}

module.exports = {
  runsInUI: runsInUI,
  runsInWorker: runsInWorker,
  initWorker: initWorker
};

