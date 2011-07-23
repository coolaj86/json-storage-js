jsonStorage
====

A light abstraction for DOMStorage (such as localStorage).

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

Since it is not valid to set `undefined` in JSON, calling `db.set('x')` is the same as `db.remove('x')`.

However, `null`, and `"null"` both parse as `null` the "object", but the string (which would be `"\"null\""`).

Therefore, setting a key to `undefined` will remove it from the db, but setting it to `null` will save it.

Yet both values that exist as `null` and values that don't exist will return `null`.

Also `{ "foo": null, "bar": "null" }` will parse as `foo` being `null` but `bar` being `"null"`, much unlike the value `"null"` being parsed on its own.
