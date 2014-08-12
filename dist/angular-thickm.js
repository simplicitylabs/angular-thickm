(function(window, document) {
  'use strict';
// Source: src/thickm/collection/collection.module.js
angular.module('thickm.collection', ['thickm.util']);
// Source: src/thickm/resource/resource.module.js
angular.module('thickm.resource', ['thickm.collection', 'thickm.util']);
// Source: src/thickm/thickm.module.js
angular.module('thickm', [
  'thickm.resource',
  'thickm.collection',
  'thickm.util'
]);
// Source: src/thickm/util/util.module.js
angular.module('thickm.util', []);
// Source: src/thickm/resource/resource.provider.js
angular.module('thickm.resource')
.provider('resourceFactory', function ResourceFactoryProvider() {

  var provider = this;

  this.setBaseUrl = function(baseUrl) {
    this.baseUrl = baseUrl;
  };

  function successErrorPromise(promise) {
    promise.success = function(fn) {
      promise.then(function(response) {
        fn(response);
      });
      return promise;
    };

    promise.error = function(fn) {
      promise.then(null, function(response) {
        fn(response);
      });
      return promise;
    };

    return promise;
  }

  this.$get = function($http, $q, ResourceCollection, ThickmUtil) {
    function resourceFactory(resourceName) {

      var resourceUrl = provider.baseUrl + resourceName;

      function Resource() {
      }

      Resource.prototype._primaryField = 'id';
      Resource.prototype._collectionClass = ResourceCollection;

      Resource.validate = function() {
        return true;
      };

      Resource.build = function(data) {
        if (!this.validate(data)) {
          throw new Error('invalid item ' + JSON.stringify(data));
        }
        return new this(data);
      };

      Resource.transformCollectionResponse = function(response) {
        return this._collectionClass.build(this, response);
      };

      Resource.transformItemResponse = function(response) {
        return this.build(response.data);
      };

      Resource.query = function(params) {
        var _self = this;
        var promise = $http.get(resourceUrl, {
              params: params ? params : null
            })
            .then(function(response) {
              return _self.transformCollectionResponse(response);
            });
        return successErrorPromise(promise);
      };

      Resource.get = function(id, params) {
        var _self = this;
        var promise = $http.get(resourceUrl + '/' + id, {
              params: params ? params : null
            })
            .then(function(response) {
              return _self.transformItemResponse(response);
            });
        return successErrorPromise(promise);
      };

      Resource.prototype.isNew = function() {
        return !((this._primaryField in this) &&
            angular.isDefined(this[this._primaryField]));
      };

      Resource.prototype.update = function(data) {
        angular.extend(this, data);
      };

      Resource.prototype.save = function() {
        var promise,
            _self = this;
        if (this.isNew()) {
          promise = $http.post(resourceUrl);
        } else {
          promise = $http.put(resourceUrl + '/' +
              this[this._primaryField]);
        }
        promise.then(function(response) {
          // @TODO: iff there is any data?
          _self.update(response.data);
        });
        return successErrorPromise(promise);
      };

      Resource.prototype.delete = function() {
        if (!this.isNew()) {
          return $http.delete(resourceUrl + '/' +
            this[this._primaryField]);
        } else {
          var deferred = $q.defer();
          deferred.resolve({});
          return successErrorPromise(deferred.promise);
        }
      };

      return Resource;
    }

    resourceFactory.baseUrl = provider.baseUrl;

    resourceFactory.resourceInit = function(subclass, resourceName) {
      var Resource = resourceFactory(resourceName);
      ThickmUtil.extend(subclass, Resource);
      angular.extend(subclass, Resource);
    };

    return resourceFactory;
  };
});
// Source: src/thickm/collection/collection.factory.js
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

  ResourceCollection.prototype.query = function(query) {
    return this.resourceClass.query(query);
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

  ResourceCollection.collectionInit = function(collection) {
    ThickmUtil.extend(collection, ResourceCollection);
    angular.extend(collection, ResourceCollection);
  };

  return ResourceCollection;

});
// Source: src/thickm/util/util.factory.js
angular.module('thickm.util')
.factory('ThickmUtil', function Util() {

  function extend(subclass, superclass) {
    var Tmp = function() {};
    Tmp.prototype = superclass.prototype;
    subclass.prototype = new Tmp();
    subclass.prototype.constructor = subclass;
  }

  return {
    extend: extend
  };
});
// Source: src/thickm/thickm.suffix
})(window, document);