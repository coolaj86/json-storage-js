(function () {
  "use strict";

  var Future = require('future')
    , __id_ = 'id'
    , nameToString = function () {
        return this.name;
      };
  
  function RowType(table) {
    var name = table.name,
      columns = table.columns,
      klass;

    klass = function (id, arr) {
      /*
      // Extending Array doesn't work very well

      var self = this;
      arr.forEach(function (item, i) {
        self[i] = item;
      });
      */
      if (!(__id_ in this)) {
        this[__id_] = id;
      }
      this.arr = arr;
    };

    // TODO make more directive-like
    // TODO create a delegates_to directive
    klass.prototype.toString = table.toString || nameToString;

    columns.forEach(function (column, i) {
      klass.prototype.__defineGetter__(column, function () {
        return this.arr[i];
        //return this[i];
      });
    });
    return klass;
  }

  function createIndexes(tables) {
    Object.keys(tables).forEach(function (name) {
      var table = tables[name],
        index,
        krow;

      if (!table.columns) {
        console.log("missing columns");
        console.log(table);
      }

      table.klass = RowType(table);

      index = table.indexed = {};

      table.rows.forEach(function (row, z) {
        // TODO no need to index
        var krow = new table.klass(z, row);
        //krow.id = z;
        index[krow[__id_]] = krow;
        table.rows[z] = krow;
      });
    });
  }

  function createRelationships(tables) {
    Object.keys(tables).forEach(function (name) {
      var table = tables[name],
        relationships,
        relHandlers = {};

      // TODO create a delegates_to directive
      relHandlers.belongs_to = function (relname) {  
        // TODO abstract name mutation
        var relation = tables[relname + 's'],
          relname_s = relname + '_id';

        table.klass.prototype.__defineGetter__(relname, function () {
          var fid = this[relname_s];

          return relation.indexed[fid];
        });
      }

      //relationships = table.relationships && table.relationships.belongs_to;
      //relationships = relationships || [];

      relationships = table.relationships || {};

      Object.keys(relationships).forEach(function (relType) {
        if (!relHandlers[relType]) {
          console.log('relationship type "' + relType + '" is not supported');
          return;
        }
        relationships[relType].forEach(relHandlers[relType]);
      });
    });
  }


  function createRelate(tables) {
    var future = Future()
      ;
    
    createIndexes(tables);
    createRelationships(tables);
    //testRelationships(tables);
    //console.log(Object.keys(data));

    future.fulfill(null, tables);

    return future.passable();
  }

  var Future = require('Future')
    , Join = require('Join')
    ;

  function createGet(pathname, tables) {
    var future = Future()
      , join = Join()
      , request = require('ahr2')
      , db = {}
      , errs = []
      ;

    tables.forEach(function (tablename) {
      var resource = pathname + '/' + tablename + ".json"
        , req = request.get(resource)
        ;

      req.when(function (err, xhr, data) {
        if (err) {
          console.log('error tables-get');
          console.log(err);
          console.log(err.message);
          return;
        }

        if (global.Buffer && data instanceof global.Buffer) {
          data = data.toString();
        }

        // TODO need to refactor AHR and fix JSON / text handling
        try {
          data = JSON.parse(data.toString());
        } catch (e) {
          // ignore, it was probably already parsed
        }
        // follow convention
        tablename = tablename.replace('-','_');
        db[tablename] = data;
      });

      join.add(req);
    });

    join.when(function () {
      // TODO add timeout as error
      if (0 == errs.length) {
        errs = null;
      }

      future.fulfill(errs, db);
    });

    return future.passable();
  }

  module.exports = {
      get: createGet
    , relate: createRelate
  };
}());
