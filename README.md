jsonStorage
====

A light abstraction for DOMStorage (such as localStorage).

Installation
===

Ender.JS (Browser)

    ender build json-storage

Node.JS (Server)

    npm install localStorage json-storage

Usage
===

Made fo for Node.JS and Ender.JS (browser-side).

    var localStorage = require('localStorage')
      , JsonStorage = require('json-storage')
      , db = JsonStorage(localStorage)
      , myValue = {
            foo: "bar"
          , baz: "quux"
        }
      ;

    db.set('myKey', myValue); 
    myValue = db.get('myKey');

API
===

  * get(key)
  * set(key, value)
  * remove(key)
  * clear()
  * keys()
  * size()

null vs undefined in JSON
===

These notes do not reflect a bugs or defects in this library,
they're simply to inform you of a few 'gotchas' inherent in JSON / DOMStorage conversion.

99.999% of the time these gotchas shouldn't effect you in any way.
If they do, you're probably doing something wrong in the first place.


It is not valid to set `undefined` in JSON. So setting a key to `undefined` will remove it from the db.

This means that `db.set('x')` is the same as `db.remove('x')`.

To save `undefined`, use `null` instead.


Note that both values that exist as `null` and values that don't exist at all will return `null`.

    db.set('existing-key', null);
    null === db.get('existing-key');
    null === db.get('non-existant-key');


The special case of `null` as `"null"`, aka `"\"null\""`:

`null`, and `"null"` both parse as `null` the "object", instead of one being the string (which would be `"\"null\""`).

Objects containing `null`, however, parse as expected `{ "foo": null, "bar": "null" }` will parse as `foo` being `null` but `bar` being `"null"`, much unlike the value `"null"` being parsed on its own.