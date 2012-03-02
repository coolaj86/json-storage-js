JsonStorage
====

A light, sensible abstraction for DOMStorage (such as localStorage).

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
      , store = JsonStorage.create(localStorage, 'my-widget-namespace')
      , myValue = {
            foo: "bar"
          , baz: "quux"
        }
      ;

    store.set('myKey', myValue); 
    myValue = store.get('myKey');

API
===

  * `JsonStorage.create(DOMStorage, namespace)`
    * `DOMStorage` should be globalStorage, sessionStorage, or localStorage
    * `namespace` is optional string which allows multiple non-conflicting storage containers
  * `store.get(key)`
  * `store.set(key, value)`
  * `store.remove(key)`
  * `store.clear()`
  * `store.keys()`
  * `store.size()`
  * `store.toJSON()`
  * `JSON.stringify(store)`

Upgrading from localStorage and 1.0.x to 1.1.x
===

1.1.x automatically attempts to upgrade your DOMStorage to use namespaces in backwards-compatible way.

However, you can prevent this behaviour:

    localStorage.getItem('_json-storage-namespaced_', true);

null vs undefined in JSON
===

These notes do not reflect a bugs or defects in this library,
they're simply to inform you of a few 'gotchas' inherent in JSON / DOMStorage conversion.

99.999% of the time these gotchas shouldn't effect you in any way.
If they do, you're probably doing something wrong in the first place.


It is not valid to set `undefined` in JSON. So setting a key to `undefined` will remove it from the store.

This means that `store.set('x')` is the same as `store.remove('x')`.

To save `undefined`, use `null` instead.


Note that both values that exist as `null` and values that don't exist at all will return `null`.

    store.set('existing-key', null);
    null === store.get('existing-key');
    null === store.get('non-existant-key');


The special case of `null` as `"null"`, aka `"\"null\""`:

`null`, and `"null"` both parse as `null` the "object", instead of one being the string (which would be `"\"null\""`).

Objects containing `null`, however, parse as expected `{ "foo": null, "bar": "null" }` will parse as `foo` being `null` but `bar` being `"null"`, much unlike the value `"null"` being parsed on its own.
