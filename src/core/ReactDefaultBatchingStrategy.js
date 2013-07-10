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
 * @providesModule ReactDefaultBatchingStrategy
 */

"use strict";

var ReactUpdates = require('ReactUpdates');

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,
  /**
   * Call the provided function in a context within which calls to `setState` and
   * friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback) {
    if (ReactDefaultBatchingStrategy.isBatchingUpdates) {
      // We're already executing in an environment where updates will be batched,
      // so this is a no-op.
      callback();
      return;
    }

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    try {
      callback();
      ReactUpdates.flushBatchedUpdates();
    } catch (error) {
      // IE8 requires `catch` in order to use `finally`.
      throw error;
    } finally {
      ReactDefaultBatchingStrategy.isBatchingUpdates = false;
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;