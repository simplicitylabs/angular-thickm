'use strict';

describe('collection factory', function() {
  beforeEach(module('thickm.collection'));

  var ResourceCollection;
  beforeEach(inject(function(_ResourceCollection_) {
    ResourceCollection = _ResourceCollection_;
  }));

  it('returns a constructor', function() {
    expect((new ResourceCollection()) instanceof ResourceCollection)
        .toEqual(true);
  });
});

describe('ResourceCollection', function() {
  beforeEach(module('thickm.collection'));

  var ResourceCollection;
  beforeEach(inject(function(_ResourceCollection_) {
    ResourceCollection = _ResourceCollection_;
  }));

  describe('array like', function() {
    var collection;

    beforeEach(function() {
      collection = new ResourceCollection();
    });

    it('has push method', function() {
      expect(angular.isFunction(collection.push)).toEqual(true);
    });

    it('has pop method', function() {
      expect(angular.isFunction(collection.pop)).toEqual(true);
    });

    it('is iterable', function() {
      collection.push({id: 1});
      collection.push({id: 2});

      expect(collection.length).toEqual(2);

      var ids = 0;
      for (var i = 0; i < collection.length; i++) {
        ids += collection[i].id;
      }

      expect(ids).toEqual(3);
    });
  });

  describe('fields', function() {
    it('has _itemsField null', function() {
      expect(ResourceCollection._itemsField).toEqual(null);
    });

    it('has _metaField meta', function() {
      expect(ResourceCollection._metaField).toEqual('meta');
    });
  });

  describe('itemsFromResponse', function() {
    function Cls() {}
    Cls.build = function() { return new Cls(); };

    it('returns array of Cls built with Cls.build when response.data is array', function() {
      var response = {data: [1, 2]};
      spyOn(Cls, 'build').andCallThrough();
      var items = ResourceCollection.itemsFromResponse(Cls, response);
      expect(items.length).toEqual(2);
      expect(items[0] instanceof Cls).toEqual(true);
      expect(Cls.build).toHaveBeenCalledWith(2);
    });

    it('returns array of Cls when response.data is object', function() {
      ResourceCollection._itemsField = 'items';
      var response = {data: {items: [1, 2]}};
      spyOn(Cls, 'build').andCallThrough();
      var items = ResourceCollection.itemsFromResponse(Cls, response);
      expect(items.length).toEqual(2);
      expect(items[0] instanceof Cls).toEqual(true);
      expect(Cls.build).toHaveBeenCalledWith(2);
    });
  });

  describe('metaFromResponse', function() {
    function Cls() {}

    it('returns empty object when no _metaField defined', function() {
      ResourceCollection._metaField = undefined;
      var response = {data: [1, 2]};
      expect(ResourceCollection.metaFromResponse(Cls, response)).toEqual({});
    });

    it('returns meta object when _metaField defined', function() {
      var response = {data: {meta: {a: 'b'}}};
      expect(ResourceCollection.metaFromResponse(Cls, response)).toEqual({a: 'b'});
    });
  });

  describe('build', function() {
    function Cls() {}
    Cls.build = function() { return new Cls(); };

    it('returns instance with Cls items', function() {
      var response = {data: [1, 2]};
      var rc = ResourceCollection.build(Cls, response);
      expect(rc.length).toEqual(2);
      expect(rc instanceof ResourceCollection).toEqual(true);
      expect(rc[0] instanceof Cls).toEqual(true);
    });

    it('returns with meta data on _meta', function() {
      ResourceCollection._itemsField = 'items';
      var response = {data: {meta: {a: 'b'}, items: [1, 2]}};
      var rc = ResourceCollection.build(Cls, response);
      expect(rc._meta).toEqual({a: 'b'});
      expect(rc[0] instanceof Cls).toEqual(true);
    });
  });

  describe('extend', function() {
    var Cls, cls;
    beforeEach(function() {
      Cls = function Cls(){};
      ResourceCollection.extend(Cls);
      cls = new Cls();
    });

    it('copies static functions functions', function() {
      expect(angular.isFunction(Cls.extend)).toEqual(true);
    });

    it('result is still instance of ResourceCollection', function() {
      expect(cls instanceof ResourceCollection).toEqual(true);
    });

    it('result is also instance of Cls', function() {
      expect(cls instanceof Cls).toEqual(true);
    });
  });

});

describe('ResourceCollection User use case', function() {
  var $httpBackend;
  var MyAPICollection;
  var User;
  var testData;

  // Set up the module to test
  beforeEach(function() {
    module('thickm.collection', 'users');
    inject(function() {});
  });

  // Set up $httpBackend
  beforeEach(inject(function(_$httpBackend_, configureHttpBackend) {
    $httpBackend = _$httpBackend_;
    configureHttpBackend($httpBackend);
  }));

  beforeEach(inject(function(_MyAPICollection_) {
    MyAPICollection = _MyAPICollection_;
  }));

  beforeEach(inject(function(_User_, _testData_) {
    User = _User_;
    testData = _testData_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('instantiated', function() {
    var collection;

    beforeEach(function() {
      collection = MyAPICollection.build(User, {data: testData.userCollectionData});
    });

    describe('hasNext method', function() {
      it('exists', function() {
        expect(angular.isFunction(collection.hasNext)).toEqual(true);
      });

      it('is true', function() {
        expect(collection.hasNext()).toEqual(true);
      });
    });

  });
});
