var ExampleApplication = React.createClass({
  render: function() {
    var elapsed = Math.round(this.props.elapsed  / 100);
    var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );
    var message =
      'React has been successfully running for ' + seconds + ' seconds.';

    return React.DOM.p(null, message);
  }
});
var start = new Date().getTime();
var c = ExampleApplication({elapsed: new Date().getTime() - start});
var remoteNode = React.getRemoteContainerReference('container');
//React.renderComponent(c, remoteNode);
//setTimeout(function() {
//  React.unmountAndReleaseReactRootNode(remoteNode);
//}, 2000);

setInterval(function() {
  React.renderComponent(
    ExampleApplication({elapsed: new Date().getTime() - start}),
    remoteNode
  );
}, 50);
