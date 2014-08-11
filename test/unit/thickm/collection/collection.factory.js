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
