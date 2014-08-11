'use strict';

angular.module('thickm.collection')
.factory('ResourceCollection', function resourceCollectionFactory(Util) {

  function ResourceCollection() {
    Array.apply(this, arguments);
  }
  Util.extend(ResourceCollection, Array);

  ResourceCollection.build = function(cls, response) {
    var rc = new this();

    var array = response.data.map(function(item) {
      return cls.build(item);
    });

    angular.forEach(array, function(resource) {
      rc.push(resource);
    });

    return rc;
  };

  return ResourceCollection;

});
