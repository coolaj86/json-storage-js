/*jshint -W054 */
;(function (exports) {
  'use strict';

  var proto
    , delim = ':'
    ;

  function stringify(obj) {
    var str;
    try {
      str = JSON.stringify(obj);
    } catch(e) {
      str = "";
    }

    return str;
  }

  function parse(str) {
    var obj = null;
    try {
      obj = JSON.parse(str);
    } catch(e) {}

    return obj;
  }

  function JsonStorage(w3cStorage, namespace, opts) {
    var me = this
      ;

    if (!(this instanceof JsonStorage)) {
      return new JsonStorage(w3cStorage, namespace, opts);
    }

    me._opts = opts || {};
    if (false === opts.stringify) {
      me._stringify = false;
    } else {
      me._stringify = true;
    }

    // if we didn't always add at least the delimeter
    // then if a keyname with the delim, it would be more
    // complicated to figure it out
    this._namespace = delim;
    this._namespace += (namespace || 'jss');

    this._store = w3cStorage;
    this._keysAreDirty = true;
    this._keys = [];
  }
  proto = JsonStorage.prototype;
  
  proto.clear = function () {
    this._keysAreDirty = true;
    this.keys().forEach(function (key) {
      this.remove(key);
    }, this);
  };

  proto.remove = function (key) {
    this._keysAreDirty = true;
    this._store.removeItem(key + this._namespace);
  };

  proto.get = function (key) {
    var item = this._store.getItem(key + this._namespace)
      ;

    return this._stringify && parse(item) || item;
  };

  proto.set = function (key, val) {
    this._keysAreDirty = true;
    return this._store.setItem(key + this._namespace, this._stringify && stringify(val) || val);
  };

  proto.keys = function () {
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

  proto.size = function () {
    return this._store.length;
  };

  proto.toJSON = function () {
    var json = {}
      ;

    this.keys().forEach(function (key) {
      json[key] = this.get(key);
    }, this);

    return json;
  };

  JsonStorage.create = JsonStorage;

  exports.JsonStorage = JsonStorage;
}('undefined' !== typeof exports && exports || new Function('return this')()));
