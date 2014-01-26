(function () {
  "use strict";

  var assert = require('assert')
    , localStorage = require('localStorage')
    , JsonStorage = require('../lib/').JsonStorage
    , db = JsonStorage.create(localStorage)
    ;

  assert.strictEqual(null, db.get('a'));

  // you can't really save undefined as JSON, it's not valid
  // the attempt to do so will delete the underlying key
  db.set('a');
  assert.strictEqual(null, db.get('a'));

  db.set('a', 1);
  assert.strictEqual(1, db.get('a'));

  db.set('a', '1');
  assert.strictEqual('1', db.get('a'));

  db.set('a', [1]);
  assert.deepEqual([1], db.get('a'));

  db.set('a', { 'a': [1] });
  assert.deepEqual({'a': [1] }, db.get('a'));

  console.log('[PASS] no assertions failed');
}());
