/** @providesModule wrapAllocation */
function wrapAllocation(x) {
  if (window.BREAK_ON_ALLOC) {
    debugger;
  }
  return x;
}

module.exports = wrapAllocation;