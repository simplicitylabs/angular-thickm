'use strict';

angular.module('thickm.collection')
.factory('ResourceCollection', function resourceCollectionFactory(ThickmUtil) {

  function ResourceCollection() {
    Array.apply(this, arguments);
  }
  ThickmUtil.extend(ResourceCollection, Array);

  ResourceCollection._itemsField = null;
  ResourceCollection._metaField = 'meta';

  ResourceCollection.itemsFromResponse = function(cls, response) {
    var data = this._itemsField ?
        response.data[this._itemsField] : response.data;
    return data.map(function(item) { return cls.build(item); });
  };

  ResourceCollection.metaFromResponse = function(cls, response) {
    return this._metaField ? response.data[this._metaField] : {};
  };

  ResourceCollection.build = function(cls, response) {
    var rc = new this();

    rc._resourceClass = cls;

    var items = this.itemsFromResponse(cls, response);
    angular.forEach(items, function(item) {
      rc.push(item);
    });

    rc._meta = this.metaFromResponse(cls, response);

    return rc;
  };

  ResourceCollection.extend = function(subclass) {
    ThickmUtil.extend(subclass, this);
    angular.extend(subclass, this);
  };

  return ResourceCollection;

});
