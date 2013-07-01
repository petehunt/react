// TODO: shim for browserify. This will be fixed soon though:
// https://github.com/substack/insert-module-globals/pull/11
window = self;
importScripts('../../build/react.js', 'example.js');