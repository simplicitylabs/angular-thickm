'use strict';

angular.module('thickm.collection')
.factory('ResourceCollection', function resourceCollectionFactory() {

  function extend(subclass, superclass) {
    var Tmp = function() {};
    Tmp.prototype = superclass.prototype;
    subclass.prototype = new Tmp();
    subclass.prototype.constructor = subclass;
  }

  function ResourceCollection() {

  }
  extend(ResourceCollection, Array);

  return ResourceCollection;

});
