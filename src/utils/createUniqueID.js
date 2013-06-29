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
 * @typechecks static-only
 * @providesModule createUniqueID
 */

"use strict";

/**
 * Size of the ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. If we assume 100 React components per page, and a user
 * loads 1 page per minute 24/7 for 50 years, with a mount point space of
 * 9,999,999 the likelihood of never having a collision is 99.997%.
 *
 * There is a possibility of race conditions if we move towards uniqueIDs
 * generated on multiple hosts in a similar timeframe. In the future we may
 * want to add additional entropy here.
 */
var MAX_ID = 9999999;

function createUniqueID() {
  return Math.ceil(Math.random() * MAX_ID);
}

module.exports = createUniqueID;
