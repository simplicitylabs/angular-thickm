'use strict';

angular.module('thickm.collection')
.factory('ThickModelCollection',
    function ThickModelCollectionFactory(ThickmUtil) {

  function ThickModelCollection() {
    Array.apply(this, arguments);
  }
  ThickmUtil.extend(ThickModelCollection, Array);

  ThickModelCollection._itemsField = null;
  ThickModelCollection._metaField = 'meta';

  ThickModelCollection.itemsFromResponse = function(cls, response) {
    var data = this._itemsField ?
        response.data[this._itemsField] : response.data;
    return data.map(function(item) { return cls.build(item); });
  };

  ThickModelCollection.metaFromResponse = function(cls, response) {
    return this._metaField ? response.data[this._metaField] : {};
  };

  ThickModelCollection.build = function(cls, response) {
    var rc = new this();

    rc._resourceClass = cls;

    var items = this.itemsFromResponse(cls, response);
    angular.forEach(items, function(item) {
      rc.push(item);
    });

    rc._meta = this.metaFromResponse(cls, response);

    return rc;
  };

  ThickModelCollection.extend = function(subclass) {
    ThickmUtil.extend(subclass, this);
    angular.extend(subclass, this);
  };

  return ThickModelCollection;

});
