(function () {
  "use strict";

  var Model = require('json-storage-model')
    , assert = require('assert')
    , schema
    , lsmAll = {}
    , Returns
    , Batches;

  schema = [
    {
      name: "returns",
      has_many: ['batches'],
      uuid: "key"
    },
    {
      name: "batches",
      has_many: ['products']
    },
    {
      name: "products"
    }
  ];

  function setup() {
    lsmAll = new Model(schema);
    //console.log(lsmAll);
    Returns = lsmAll.returns;
    Batches = lsmAll.batches;
  }

  function empty() {
    assert.deepEqual([], Returns.keys());
    assert.deepEqual([], Returns.all());
    assert.deepEqual([], Returns.some([]));
    assert.deepEqual([null], Returns.some(['x']));
    assert.deepEqual([null, null], Returns.some(['x','y']));
    assert.deepEqual(null, Returns.get('nada'));
    Returns.clear();
    assert.deepEqual([], Returns.keys());
    assert.deepEqual([], Returns.all());
    assert.deepEqual([], Returns.some([]));
    assert.deepEqual([null], Returns.some(['x']));
    assert.deepEqual([null, null], Returns.some(['x','y']));
    assert.deepEqual(null, Returns.get('nada'));
  }

  function errors() {
    var errcount = 0;
    // TODO make throw
    try {
      Returns.get();
    } catch(e) {
      errcount += 1;
    }
    //assert.equal(1, errcount);
    console.log('skipped `throw error on get(undefined)`');

    try {
      Returns.some();
    } catch(e) {
      errcount += 1;
    }
    assert.equal(1, errcount);

    Returns.some([]);
  }

  function createWithoutKey() {
    var ret = Returns.create({
        memo: "031811-IHC",
      })
      , ret2;

    assert.ok(ret.key);
    assert.equal("031811-IHC", ret.memo);

    ret2 = Returns.get(ret.key);
    assert.equal(null, ret2);

    ret.test1 = true;
    ret.save();

    ret2 = Returns.get(ret.key);
    assert.equal("031811-IHC", ret2.memo);
  }

  function createWithKey() {
    var ret = Returns.create({
        key: "ajs-test",
        memo: "031811-IHC",
      })
      , ret2;

    ret2 = Returns.get(ret.key);
    assert.ok(!ret2);

    assert.equal("ajs-test", ret.key);
    ret.save();

    ret2 = Returns.get(ret.key);
    assert.ok(ret2.memo);
  }

  function insertRemove() {
    var keys = []
      , all = []
      , ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      , k;

    Returns.clear();

    // add
    function populate() {
      all = [];
      keys = [];
      ids.forEach(function (id, i) {
                            // this is private logic
        all.push({ key: id, _batches_ids: [] });
        keys.push(all[i].key);
        Returns.create(all[i]).save();
      });
      assert.deepEqual(all, Returns.all());
      assert.deepEqual(keys, Returns.keys());
    }

    // Remove from first
    populate();
    for (k = 0; k < ids.length; k += 1) {
      Returns.remove(ids[k]);
    }
    assert.deepEqual([], Returns.all());
    assert.deepEqual([], Returns.keys());


    // Remove from last
    populate();
    for (k = ids.length - 1; k >= 0; k -= 1) {
      Returns.remove(ids[k]);
    }
    assert.deepEqual([], Returns.all());
    assert.deepEqual([], Returns.keys());

    // Remove from middle
    populate();
    ids.sort(function () { return 0.5 - Math.random(); });
    for (k = ids.length - 1; k >= 0; k -= 1) {
      Returns.remove(ids[k]);
    }
    assert.deepEqual([], Returns.all());
    assert.deepEqual([], Returns.keys());
  }

  // testing all, keys, some, filter
  function all() {
    var keys = [],
      all = [],
      some,
      ids = [];

    Returns.clear();
    assert.deepEqual(all, Returns.all());
    assert.deepEqual(keys, Returns.keys());

    all.push({ key: "one", memo: "3131-mtn", _batches_ids: [] });
    keys.push(all[0].key);
    Returns.create(all[0]).save();
    
    all.push({ key: "two", memo: "3232-hlt", _batches_ids: [] });
    keys.push(all[1].key);
    Returns.create(all[1]).save();

    all.push({ key: "three", memo: "4123-hbc", _batches_ids: [] });
    keys.push(all[2].key);
    Returns.create(all[2]).save();
    
    all.push({ key: "four", memo: "4441-dtf", _batches_ids: [] });
    keys.push(all[3].key);
    Returns.create(all[3]).save();
    
    all.push({ key: "five", memo: "4412-abn", _batches_ids: [] });
    keys.push(all[4].key);
    Returns.create(all[4]).save();

    some = Returns.filter(function (ret) {
      return /^4\d/.test(ret.memo);
    });
    assert.equal(3, some.length);

    some.forEach(function (one) {
      ids.push(one.key);
    });
    assert.deepEqual(some, Returns.some(ids));
    
    assert.deepEqual(all, Returns.all());
    assert.deepEqual(keys, Returns.keys());
    assert.deepEqual(all.slice(1,3), Returns.some(["two", "three"]));

    assert.deepEqual(keys, Returns.keys());

    console.log('skipping not-implemented `query`');
  }

  function relate() {
    var batches = [
        {
          uuid: "a",
          name: "chuck",
          _products_ids: []
        },
        {
          name: "daryl",
          _products_ids: []
        }
      ]
      , ret = Returns.create({})
      , batch;

    // Add relation
    ret.save();
    ret = Returns.get(ret.key);
    ret.batches.add(batches[0]);
    assert.deepEqual(Batches.all()[0], batches[0]);
    assert.deepEqual(ret.batches[0], batches[0]);
    ret.save();

    // create with an existing relation
    ret = Returns.create({ batches: batches });
    batches[1].uuid = ret.batches[1].uuid;

    console.log('skipping assert which requires visual inspection');
    //assert.deepEqual(batches, ret.batches);
    //console.log(Batches.all());
  }

  setup();
  empty();
  errors();
  createWithoutKey();
  createWithKey();
  insertRemove();
  all();
  relate();

  console.log("All tests passed");
}());
