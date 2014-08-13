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

    describe('query method', function() {
      it('exists', function() {
        expect(angular.isFunction(collection.query)).toEqual(true);
      });
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
