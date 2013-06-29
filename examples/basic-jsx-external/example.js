/**
 * @jsx React.DOM
 */

// todo: multiple styleRefs? how to reflect modes?

// util
function copyProperties(dst, src) {
  for (var k in src) {
    if (src.hasOwnProperty(k)) {
      dst[k] = src[k];
    }
  }
}

var GlobalStyleRepository = {
  baseStyles: {},
  styles: {},
  registerProvider: function(component) {
    // TODO: build in reconciliation here. That's why we deal with instances, not constructors.
    if (component.styles) {
      this.styles[component.constructor.displayName] = component.styles;
    }
    if (component.baseStyles) {
      this.baseStyles[component.constructor.displayName] = component.baseStyles;
    }
  },
  unregisterProvider: function(component) {
    // who gives a crap, right now.
  }
};

function clausesMatch(pathClause, selectorClause) {
  return pathClause === selectorClause;
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
    var component = path[i].split('/')[0];
    if (!styles[component]) {
      continue;
    }
    for (var selectors in styles[component]) {
      if (!styles[component].hasOwnProperty(selectors)) {
        continue;
      }
      selectors.split(',').map(function(selector) {
        if (matchPathWithSelector(path, selector.split(' '))) {
          copyProperties(computed, styles[component][selectors]);
        }
      });
    }
  }
}

function calcStyle(path, styles, baseStyles) {
  var computed = {};
  _calcStyle(computed, path, baseStyles);
  _calcStyle(computed, path, styles);
  return computed;
}

var StylableMixin = {
  computeStyle: function() {
    if (!this.getFullStyleRef()) {
      return null;
    }
    return calcStyle(this.getStylePath(), GlobalStyleRepository.styles, GlobalStyleRepository.baseStyles);
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
  },
  register: function() {
    GlobalStyleRepository.registerProvider(this);
  },
  componentWillMount: function() {
    this.register();
  },
  componentDidUpdate: function() {
    // with batching this won't be a perf hit really!
    this.register();
  },
  componentWillUnmount: function() {
    GlobalStyleRepository.unregisterProvider(this);
  }
};

function getStylableNativeComponent(key, nativeComponent) {
  return React.createClass({
    displayName: key,
    mixins: [StylableMixin],
    render: function() {
      return this.transferPropsTo(<nativeComponent style={this.computeStyle()}>{this.props.children}</nativeComponent>);
    }
  });
}

function patchDOM() {
  for (var key in React.DOM) {
    if (React.DOM.hasOwnProperty(key)) {
      React.DOM[key] = getStylableNativeComponent(key, React.DOM[key]);
    }
  }
}

function patchReact() {
  var createClass = React.createClass;
  React.createClass = function(d) {
    if (!d.mixins) {
      d.mixins = [];
    }
    d.mixins.push(StylableMixin);
    return createClass(d);
  };
}

function patch() {
  patchDOM();
  patchReact();
}

patch();

var Child = React.createClass({
  styles: {
    'Child/thediv': {
      color: 'blue'
    }
  },
  render: function() {
    return <div styleRef="thediv">My path is {this.getStylePath().join(' ')}</div>;
  }
});

var Parent = React.createClass({
  render: function() {
    return <Child styleRef="child" />;
  }
});

var ExampleApplication = React.createClass({
  styles: {
    'Child/thedivx': {
      color: 'red'
    }
  },
  render: function() {
    return <Parent styleRef="parent" />;
  }
});

React.renderComponent(
  <ExampleApplication />,
  document.getElementById('container')
);
