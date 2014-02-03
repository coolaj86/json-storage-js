JsonStorage
====

A light, sensible abstraction for DOMStorage (such as localStorage).

Installation
===

Bower (Browser)

```bash
bower install json-storage
# or
wget https://raw2.github.com/coolaj86/json-storage-js/master/json-storage.js
```

Node.JS (Server)

```bash
npm install localStorage json-storage
```

Usage
===

Made for Node.js and Bower (browser-side).

    var localStorage = require('localStorage')
      , JsonStorage = require('json-storage').JsonStorage
      , store = JsonStorage.create(localStorage, 'my-widget-namespace', { stringify: true })
      , myValue = {
            foo: "bar"
          , baz: "quux"
        }
      ;

    store.set('myKey', myValue); 
    myValue = store.get('myKey');

NOTE: When using with Node and the `localStorage` module,
you may wish to pass the `{ stringify: false }` option to prevent double stringification.

API
===

  * `JsonStorage.create(DOMStorage, namespace, opts)`
    * `DOMStorage` should be globalStorage, sessionStorage, or localStorage. Defaults to window.localStorage if set to `null`.
    * `namespace` is optional string which allows multiple non-conflicting storage containers. For example you could pass two widgets different storage containers and not worry about naming conflicts:
      * `Gizmos.create(JsonStorage.create(null, 'my-gizmos'))`
      * `Gadgets.create(JsonStorage.create(null, 'my-gadgets'))`
    * `opts`
      * `stringify` set to `false` in `node` to avoid double stringifying
  * `store.get(key)`
  * `store.set(key, value)`
  * `store.remove(key)`
  * `store.clear()`
  * `store.keys()`
  * `store.size()`
  * `store.toJSON()`
  * `JSON.stringify(store)`

**NOTE**: You cannot omit optional parameters. Use `null` if you want accepts the defaults for some things and provide a values for others. For example: `JsonStorage.create(null, null, { stringify: false })`

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
