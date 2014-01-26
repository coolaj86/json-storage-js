(function () {
  "use strict";

  var localStorage = require('localStorage')
    , JsonStorage = require('../lib/').JsonStorage
    , db = JsonStorage.create(localStorage)
    , assert = require('assert')
    ;

  assert.equal(null, db.get('x'));
  assert.deepEqual([], db.keys(), 'found keys in empty db: ' + JSON.stringify(db.keys()));
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

  db.set('a', 'b');
  assert.deepEqual(['a'], db.keys());
  assert.deepEqual({ 'a': 'b' }, db.toJSON());

  console.log("Done! All tests pass.");
}());
