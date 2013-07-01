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
 * @providesModule SyntheticEventSerialization
 * @typechecks static-only
 */

"use strict";

var mergeInto = require('mergeInto');

var SyntheticMouseEvent = require('SyntheticMouseEvent');
var SyntheticUIEvent = require('SyntheticUIEvent');
var SyntheticFocusEvent = require('SyntheticFocusEvent');
var SyntheticMutationEvent = require('SyntheticMutationEvent');
var SyntheticWheelEvent = require('SyntheticWheelEvent');
var SyntheticKeyboardEvent = require('SyntheticKeyboardEvent');
var SyntheticTouchEvent = require('SyntheticTouchEvent');

var EVENT_CLASSES = {
  SyntheticMouseEvent: SyntheticMouseEvent,
  SyntheticUIEvent: SyntheticUIEvent,
  SyntheticFocusEvent: SyntheticFocusEvent,
  SyntheticMutationEvent: SyntheticMutationEvent,
  SyntheticWheelEvent: SyntheticWheelEvent,
  SyntheticKeyboardEvent: SyntheticKeyboardEvent,
  SyntheticTouchEvent: SyntheticTouchEvent
};

var ATTRIBUTE_BLACKLIST = {
  nativeEvent: null,
  currentTarget: null,
  target: null,
  view: null,
  relatedTarget: null
};

var SyntheticEventSerialization = {
  serialize: function(event) {
    var serialized = {};
    mergeInto(serialized, event);
    mergeInto(serialized, ATTRIBUTE_BLACKLIST);
    // TODO: don't rely on constructor.name
    serialized.__class = event.constructor.name;
    return serialized;
  },
  deserialize: function(serialized) {
    var eventClass = EVENT_CLASSES[serialized.__class];
    delete serialized.__class;
    var event = new eventClass(serialized.dispatchConfig, serialized.dispatchMarker, {});
    mergeInto(event, serialized);
    return event;
  }
};

module.exports = SyntheticEventSerialization;