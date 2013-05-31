/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactServerRendering
 */

function browserShim(context, globalContext, config) {
  // This is mostly empty now, but we leave it in in case
  // we want to add more shims later.

  if (globalContext) {
    context.console = globalContext.console;
  }

  context.__config = config;
  context.__t = function() {};

  resetShim(context);
}

function resetShim(context) {
  // Reset the only parts of the shim we need, in case we call this
  // in a high-volume server environment.
  context.server = {
    head: [], // in case you want to inject scripts into the head
    state: {}, // shared state w/ server
    config: context.__config // any config info you want to pass
  };
}

function shimSetTimeout(context, f) {
  var actualSetTimeout = context.setTimeout;
  var actualSetInterval = context.setInterval;
  context.setTimeout = context.setInterval = function() {};
  try {
    return f();
  } finally {
    context.setTimeout = actualSetTimeout;
    context.setInterval = actualSetInterval;
  }
}


function getComponentMarkup(id, component, callback) {
  resetShim(global);
  var ReactReconcileTransaction = require('ReactReconcileTransaction');
  var transaction = ReactReconcileTransaction.getPooled();
  transaction.reinitializeTransaction();
  try {
    return shimSetTimeout(global, function() {
      transaction.perform(function() {
        callback({
          body: component.mountComponent(id, transaction),
          head: global.server.head,
          state: global.server.state
        });
      }, null);
    });
  } finally {
    ReactReconcileTransaction.release(transaction);
  }
}

module.exports = {
  browserShim: browserShim,
  getComponentMarkup: getComponentMarkup
};
