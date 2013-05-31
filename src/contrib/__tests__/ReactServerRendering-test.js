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
 * @jsx React.DOM
 * @emails react-core
 */

"use strict";

require('mock-modules')
  .dontMock('ExecutionEnvironment')
  .dontMock('React')
  .dontMock('ReactServerRendering')
  .dontMock('ReactTestUtils');

var React;
var ReactTestUtils;
var ReactServerRendering;
var ExecutionEnvironment;

describe('ReactServerRendering', function() {
  beforeEach(function() {
    require('mock-modules').dumpCache();
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');
    ExecutionEnvironment = require('ExecutionEnvironment');
    ExecutionEnvironment.canUseDOM = false;
    ReactServerRendering = require('ReactServerRendering');
  });

  it('should generate simple markup and be idempotent', function() {
    var response;
    ReactServerRendering.getComponentMarkup(
      'rR',
        <span>hello world</span>,
      function(response_) {
        response = response_;
      }
    );
    expect(response).toEqual({
      body: '<span  id="rR">hello world</span>',
      head: [],
      state : {}
    });
    var response2;
    ReactServerRendering.getComponentMarkup(
      'rR',
        <span>hello world</span>,
      function(response_) {
        response2 = response_;
      }
    );
    expect(response).toEqual(response2);
  });
});
