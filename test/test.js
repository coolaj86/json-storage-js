(function () {
  "use strict";

  var localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , db = JsonStorage(localStorage)
    , assert = require('assert')
    ;

  assert.equal(null, db.get('x'));
  assert.deepEqual([], db.keys());
  db.clear();
  assert.equal(null, db.get('x'));

  db.set('a', 'b');
  assert.deepEqual(['a'], db.keys());
  assert.equal('b', db.get('a'));

  db.remove('a');
  assert.deepEqual([], db.keys());

  db.set('a', 'b');
  db.clear();
  assert.deepEqual([], db.keys());

  console.log("Done! All tests pass.");
}());
