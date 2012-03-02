(function () {
  "use strict";

  var localStorage = require('localStorage')
    , jsonStorage = require('../lib/')
    , assert = require('assert')
    , store0 = jsonStorage.create(localStorage, '0')
    , store1 = jsonStorage.create(localStorage, '1')
    ;

  store0.set('foo', 'bar');
  store1.set('foo', 'baz');

  assert.strictEqual('bar', store0.get('foo'));
  assert.strictEqual('baz', store1.get('foo'));

  store0.remove('foo');

  assert.strictEqual(null, store0.get('foo'));
  assert.strictEqual('baz', store1.get('foo'), 'after removing a value from store1, store0 lost it as well');

  store0.clear();

  assert.strictEqual(null, store0.get('foo'));
  assert.strictEqual('baz', store1.get('foo'), 'after clearing store0, store1 lost values');

  console.log('[PASS] no assertions failed');
}());
