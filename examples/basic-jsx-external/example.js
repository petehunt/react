/**
 * @jsx React.DOM
 */

// util
function copyProperties(dst, src) {
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      dst[k] = src[k];
    }
  }
}

function clausesMatch(pathClause, selectorClause) {
  console.log(pathClause, selectorClause);
  return pathClause === selectorClause;
  /*
  var pathParts = pathClause.split('/');
  var selectorParts = selectorClause.split('/');

  if (pathClause.indexOf('/') === -1) {
    // TODO: get rid of this capability?
    return selectorParts[1] === '*';
  }

  // TODO: get rid of
  return pathParts[0] === selectorParts[0] && (pathParts[1] === selectorParts[1] || selectorParts[1] === '*');
  */
}

function matchPathWithSelector(path, selector) {
  // iterate through path until we find a match, then move to
  // next selector clause. if both terminate at the same time
  // they match
  var selectorIndex = selector.length - 1;
  for (var pathIndex = path.length - 1; pathIndex >= 0; pathIndex--) {
    if (clausesMatch(path[pathIndex], selector[selectorIndex])) {
      selectorIndex--;
    }
  }
  return selectorIndex === -1;
}

function _calcStyle(computed, path, styles) {
  for (var i = path.length - 1; i >= 0; i--) {
    var component = path.split('/')[0];
    if (!styles[component]) {
      continue;
    }
    for (var selectors in styles[component]) {
      if (!styles[component].hasOwnProperty(selectors)) {
        continue;
      }
      selectors.split(',').map(function(selector) {
        if (matchPathWithSelector(path, selector)) {
          copyProperties(computed, styles[component][selectors]);
        }
      });
    }
  }
}

function calcStyle(path, styles, baseStyles) {
  var computed = {};
  _calcStyle(computed, path, baseStyles);
  _calcstyle(computed, path, styles);
  return computed;
}

var StylableMixin = {
  computeStyle: function(style, baseStyle) {
    throw new Error('not implemented...yet.');
  },
  getFullStyleRef: function() {
    if (!this.props.styleRef) {
      // No styleRef prop, therefore you can't style this node.
      return null;
    }
    return (this.props['{owner}'] ? this.props['{owner}'].constructor.displayName : '') + '/' + this.props.styleRef;
  },
  // TODO: componentDidMount, crawl up the owner hierarchy to register listeners etc.
  getStylePath: function() {
    var current = this;
    var path = [];

    while (current) {
      var ref = current.getFullStyleRef && current.getFullStyleRef();
      if (ref) {
        path.push(ref);
      } else {
        // Just record the owner name
        if (current.props['{owner}']) {
          path.push(current.props['{owner}'].constructor.displayName);
        }
      }
      current = current.props['{owner}'];
    }

    path.reverse();
    return path;
  }
};

var Child = React.createClass({
  mixins: [StylableMixin],
  render: function() {
    return <div>My path is {this.getStylePath().join(' ')}</div>;
  }
});

var Parent = React.createClass({
  mixins: [StylableMixin],
  render: function() {
    return <Child styleRef="child" />;
  }
});

var ExampleApplication = React.createClass({
  mixins: [StylableMixin],
  render: function() {
    return <Parent styleRef="parent" />;
  }
});

React.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
);
