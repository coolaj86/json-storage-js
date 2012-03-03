(function () {
  "use strict";

  var Store
    , delim = ':'
    ;

  function Stringify(obj) {
    var str;
    try {
      str = JSON.stringify(obj);
    } catch(e) {
      str = "";
    }

    return str;
  }

  function Parse(str) {
    var obj = null;
    try {
      obj = JSON.parse(str);
    } catch(e) {}

    return obj;
  }

  function escapeRegExp(str) {
    return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function upgradeStorage(jss, w3cs) {
    var i
      , key
      , val
      , json = {}
      ;

    if (jss._store.getItem('_json-storage-namespaced_', true)) {
      return;
    }

    // we can't modify the db while were reading or
    // the keys will shift all over the place
    for (i = 0; i < w3cs.length; i += 1) {
      key = w3cs.key(i);
      try {
        val = JSON.parse(w3cs.getItem(key));
      } catch(e) {
        return;
      }
      json[key] = val;
    }
    w3cs.clear();

    Object.keys(json).forEach(function (key) {
      jss.set(key, json[key]);
    });

    jss._store.setItem('_json-storage-namespaced_', true);
  }

  function JsonStorage(w3cStorage, namespace) {
    // called without new or create
    // global will be undefined
    if (!this) {
      return new JsonStorage(w3cStorage, namespace);
    }

    // if we didn't always add at least the delimeter
    // then if a keyname with the delim, it would be more
    // complicated to figure it out
    this._namespace = delim;
    this._namespace += (namespace || 'jss');

    this._store = w3cStorage;
    this._keysAreDirty = true;
    this._keys = [];
    if (!this._store.getItem('_json-storage-namespaced_')) {
      upgradeStorage(this, w3cStorage);
    }
  }
  Store = JsonStorage;
  
  Store.prototype.clear = function () {
    this._keysAreDirty = true;
    this.keys().forEach(function (key) {
      this.remove(key);
    }, this);
  };

  Store.prototype.remove = function (key) {
    this._keysAreDirty = true;
    this._store.removeItem(key + this._namespace);
  };

  Store.prototype.get = function (key) {
    return Parse(this._store.getItem(key + this._namespace));
  };

  Store.prototype.set = function (key, val) {
    this._keysAreDirty = true;
    return this._store.setItem(key + this._namespace, Stringify(val));
  };

  Store.prototype.keys = function () {
    var i
      , key
      , delimAt
      ;

    if (!this._keysAreDirty) {
      return this._keys.concat([]);
    }

    this._keys = [];
    for (i = 0; i < this._store.length; i += 1) {
      key = this._store.key(i) || '';

      delimAt = key.lastIndexOf(this._namespace);
      // test if this key belongs to this widget
      if (-1 !== delimAt) {
        this._keys.push(key.substr(0, delimAt));
      }
    }
    this._keysAreDirty = false;

    return this._keys.concat([]);
  };

  Store.prototype.size = function () {
    return this._store.length;
  };

  Store.prototype.toJSON = function () {
    var json = {}
      ;

    this.keys().forEach(function (key) {
      json[key] = this.get(key);
    }, this);

    return json;
  };

  Store.create = function (w3cStorage, namespace) {
    return new JsonStorage(w3cStorage, namespace);
  }

  module.exports = Store;
}());
