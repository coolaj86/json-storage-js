(function () {
  "use strict";

  var localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , jsonStorage = JsonStorage(localStorage)
    , db = jsonStorage
    , uuidgen = require('node-uuid')
    , schemamap = {}
    ;


  function create(schema) {
    var models = {};

    function createModel(lsmodel, prefix, submodels, uuid) {
      //
      // New Model
      //
      function LModel(obj) {
        var lmodel = this;

        // Add any already-appended submodels
        // TODO DRY this up
        submodels.forEach(function (subname) {
          var sub_ids = '_' + subname + '_ids'
            , subs = obj[subname]
            , suuid = schemamap[subname].uuid || 'uuid';

          // Just in case the object is already created
          if ('function' === typeof obj.__lookupGetter__(subname)) {
            return;
          }

          if (false === Array.isArray(subs)) {
            return;
          }

          obj[sub_ids] = [];
          lmodel[sub_ids] = obj[sub_ids];

          subs.forEach(function (sub) {
            if (!sub[suuid]) {
              sub[suuid] = uuidgen();
            }
            models[subname].set(sub[suuid], sub);
            lmodel[sub_ids].push(sub[suuid]);
          });

          obj[subname] = undefined;
          delete obj[subname];
        });

        // Copy object to this
        Object.keys(obj).forEach(function (k) {
          lmodel[k] = obj[k];
        });

        // create uuid if it has none
        if (undefined === obj[uuid]) {
          obj[uuid] = uuidgen();
          lmodel[uuid] = obj[uuid];
        }
      }

      // A simple save method
      LModel.prototype.save = function () {
        lsmodel.set(this[uuid], this);
      };


      // getters for submodels
      submodels.forEach(function (subname) {
        var sub_ids = '_' + subname + '_ids';

        LModel.prototype.__defineGetter__(subname, function () {
          // not all submodels exist at "compile-time"
          var submodel = models[subname]
            , lmodel = this
            , subs
            , suuid = schemamap[subname].uuid || 'uuid';

          lmodel[sub_ids] = lmodel[sub_ids] || [];

          subs = submodel.some(lmodel[sub_ids]);

          // modify collection, but leave as array with forEach
          // XXX maybe create prototype with forEach
          subs.add = function (obj) {
            subs.push(obj);
            if (undefined === obj[suuid]) {
              submodel.add(obj);
            } else {
              submodel.set(obj[suuid], obj);
            }
            lmodel[sub_ids].push(obj[suuid]);
            lmodel.save();
          };

          return subs;
        });
      });

      return LModel;
    }


    // A database abstraction
    function Model(model) {
      var lsmodel = this
        , prefix = model.name
        , submodels = model.has_many || []
        , uuid = model.uuid || 'uuid'
        , LModel = createModel(lsmodel, prefix, submodels, uuid);

      lsmodel.create = function (a, b, c) {
        return new LModel(a, b, c)
      };


      // clear
      lsmodel.clear = function () {
        return db.set(prefix + '-lsm', []);
      };

      // all keys
      lsmodel.keys = function () {
        return db.get(prefix + '-lsm');
      };

      // all items
      lsmodel.all = function () {
        var items = [];
        lsmodel.keys().forEach(function (uuid) {
          var item = lsmodel.get(uuid)
          // TODO this should be a useless check
          if (null === item) {
            lsmodel.remove(uuid);
            return;
          }
          items.push(item);
        });
        return items;
      };

      // TODO query accepts objects
      lsmodel.query = function (obj) {
        //
        return null;
      };

      // pass in your filter function
      lsmodel.filter = function (test) {
        var all = lsmodel.all(),
          results = [];

        all.forEach(function (one) {
          if (!test(one)) {
            return;
          }
          results.push(one);
        });
        return results;
      }

      lsmodel.some = function (uuids) {
        var results = [];

        uuids.forEach(function (uuid) {
          var one = lsmodel.get(uuid);
          // push null elements to keep array indices
          results.push(one);
        });

        return results;
      }

      // TODO query object
      lsmodel.get = function (uuid) {
        var item = db.get(uuid);
        if (null === item) {
          return null;
        }
        return new LModel(item);
      };

      lsmodel.set = function (uuid, val) {
        var keys;

        if (null === val || undefined === val) {
          return db.remove(uuid);
        }
        keys = db.get(prefix + '-lsm') || [];

        // add the key if it didn't exist
        if (-1 === keys.indexOf(uuid)) {
          keys.push(uuid);
          db.set(prefix + '-lsm', keys);
        }

        submodels.forEach(function (mod) {
          var children = val[mod] || [];

          // TODO decouple or create new objects
          children.forEach(function (child) {
            var e;
            if (null === child) {
              return;
            }
            if ('string' === typeof child) {
              return;
            }
            if ('string' !== typeof child.uuid) {
              return;
            }
            // TODO other[mod].set(uuid, child);
          });
        });
        /*
        console.log('\n\n val');
        console.log(val);
        console.log('\n\n');
        */
        db.set(uuid, val)
      };

      // Remove an item from the table list and the db
      lsmodel.remove = function (uuid) {
        var keys = db.get(prefix + '-lsm')
          , i;

        keys.forEach(function (key, j) {
          if (key === uuid) {
            i = j;
          }
        });

        if (undefined === i) {
          return;
        }
        db.remove(uuid);
        keys.splice(i,1);
        db.set(prefix + '-lsm', keys);
      };

      // Remove all objects from the table list and db
      lsmodel.clear = function () {
        lsmodel.keys().forEach(function (uuid) {
          db.remove(uuid);
        });
        db.set(prefix + '-lsm', []);
      };

      lsmodel.add = function (val) {
        var obj = lsmodel.create(val);
        obj.save();
        return obj;
      };
    }

    // TODO compare versions of schema
    db.set('schema-lsm', schema);

    schema.forEach(function (scheme) {
      var table = scheme.name
        , x = db.get(table + '-lsm')
        ;

      // Pre-create the "models" tableshould always have 
      schemamap[scheme.name] = scheme;
      if (!Array.isArray(x)) {
        db.set(table + '-lsm', []);
      }

      models[scheme.name] = new Model(scheme);
    });
    
    return models;
  }

  module.exports = create;
}());
