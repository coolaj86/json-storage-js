(function () {
  "use strict";

  var db;

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

  function JsonStorage(w3cStorage) {
    this.db = w3cStorage;
    this.keysAreDirty = true;
  }
  db = JsonStorage;
  
  db.prototype.clear = function () {
    this.keysAreDirty = true;
    this.keys().forEach(function (uuid) {
      this.remove(uuid);
    }, this);
  };

  db.prototype.remove = function (uuid) {
    this.keysAreDirty = true;
    this.db.removeItem(uuid);
  };

  db.prototype.get = function (uuid) {
    return Parse(this.db.getItem(uuid));
  };

  db.prototype.set = function (uuid, val) {
    this.keysAreDirty = true;
    return this.db.setItem(uuid, Stringify(val));
  };

  db.prototype.keys = function () {
    var i
      ;

    if (!this.keysAreDirty) {
      return this.__keys.concat([]);
    }

    this.__keys = [];
    for (i = 0; i < this.db.length; i += 1) {
      this.__keys.push(this.db.key(i));
    }
    this.keysAreDirty = false;

    return this.__keys.concat([]);
  };

  db.prototype.size = function () {
    return this.db.length;
  };

  function create(w3cStorage) {
    return new JsonStorage(w3cStorage);
  }

  module.exports = create;
}());
