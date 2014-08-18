(function(window, document) {
  'use strict';
// Source: src/thickm/collection/collection.module.js
angular.module('thickm.collection', ['thickm.util']);
// Source: src/thickm/resource/resource.module.js
/**
 * @ngdoc module
 * @name resource
 * @description
 *
 * ## Resource
 *
 * This module houses the Resource provider, which is the main entry point for
 * using the library. 
 */
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
/**
 * @ngdoc service
 * @name resource.ResourceProvider
 * @description
 *
 * The main provider for the library, which takes global configuration.
 */
angular.module('thickm.resource')
.provider('Resource', function ResourceFactoryProvider() {

  var provider = this;

  /**
   * @ngdoc method
   * @name resource.ResourceProvider.setBaseUrl
   * @description
   * Set the base URL for the API, e.g. `http://example.com/api/v1/` for an
   * API which has collections such as `http://example.com/api/v1/users` or
   * `http://example.com/api/v1/groups`.
   *
   * @param {string} baseUrl The base URL for the API, e.g.
   *                         `http://example.com/api/v1/`.
   */
  this.setBaseUrl = function(baseUrl) {
    this.baseUrl = baseUrl;
  };

  this.headers = {
    post: {
      'Content-Type': 'application/json'
    },
    put: {
      'Content-Type': 'application/json'
    },
    delete: {
      'Content-Type': 'application/json'
    }
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

  this.$get = function($http, $q, ResourceCollection) {

      /**
       * @ngdoc service
       * @class
       * @name resource.Resource
       * @description
       *
       * Constructor for the `Resource` class, which is the main point of entry
       * for this library. This is the main class to subclass in order to create
       * models for an application, or to create an API-specific super class.
       *
       * @param {Object} data Data to create the `Resource` from, will be come
       *                      properties of the new `Resource` object.
       */
      function Resource(data) {
        angular.extend(this, data);
      }

      // The endpoint name, i.e. 'items' in `/api/v1/items`
      Resource.prototype._resourceName = 'items';

      // The field of an item to do lookups by
      Resource.prototype._primaryField = 'id';

      // The Resource's collection class, i.e. the class used to represent a
      // collection of items.
      Resource._collectionClass = ResourceCollection;

      /**
       * @ngdoc function
       * @name resource.Resource.validate
       * @propertyOf resource.Resource
       * @description
       * Validate data for a Resource.
       *
       * @param {Object} data The data to validate.
       * @returns {boolean} True if the object is valid, false otherwise.
       */
      Resource.validate = function(data) {
        return angular.isObject(data);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.build
       * @propertyOf resource.Resource
       * @description
       * Resource factory method. Takes data object and uses the `Resource`
       * constructor to create a new `Resource`. The object is validated with
       * `validate`. Throws error if the data is invalid.
       *
       * @param  {Object} data Data for the new Resource.
       * @return {Object<Resource>} new Resource
       */
      Resource.build = function(data) {
        if (!this.validate(data)) {
          throw new Error('invalid item ' + JSON.stringify(data));
        }
        return new this(data);
      };

      /**
       * @ngdoc method
       * @name resource.Resource.prototype.getCollectionUrl
       * @methodOf resource.Resource
       * @description
       * Get the collection URL, e.g. `http://example.com/api/v1/users`. Uses
       * base API URL from the provider, `provider.baseUrl` and `_resourceName`.
       *
       * @return {string} The collection URL
       */
      Resource.prototype.getCollectionUrl = function() {
        return (provider.baseUrl || '/') + this._resourceName;
      };

      /**
       * @ngdoc method
       * @name resource.Resource.prototype.getResourceUrl
       * @methodOf resource.Resource
       * @description
       * Get the Resource URL, e.g. `http://example.com/api/v1/users/1337`. Uses
       * `getCollectionUrl()` and `_primaryField`.
       *
       * @param {string} id The ID of the resource for which to get the URL
       * @returns {string} The resource URL
       */
      Resource.prototype.getResourceUrl = function(id) {
        return this.getCollectionUrl() + '/' + (id || this[this._primaryField]);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.transformCollectionResponse
       * @methodOf resource.Resource
       * @description
       * Transform an collection response into an object. Uses the collection
       * class' `build` method to create a collection from the HTTP response.
       *
       * @param {Object<response>} response Response object from `$http`
       * @returns {Object<collection class>} Collection class instance
       */
      Resource.transformCollectionResponse = function(response) {
        return this._collectionClass.build(this, response);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.transformItemResponse
       * @propertyOf resource.Resource
       * @description
       * Transform an item response into an object. Uses the `build` method to
       * create an instance of `Resource` from the HTTP response.
       *
       * @param {Object<response>} response Response object form `$http`.
       * @returns {Resource} Resource
       */
      Resource.transformItemResponse = function(response) {
        return this.build(response.data);
      };

      /**
       * @ngdoc method
       * @name resource.Resource.prototype.transformItemRequest
       * @methodOf resource.Resource
       * @description
       * Transform an item request. This is also where the headers for a
       * request can be altered in a subclass.
       *
       * @param {Object} headers Headers object
       * @returns {Object} Object which is sent to API.
       */
      /*jshint unused:false */
      Resource.prototype.transformItemRequest = function(headers) {
        return this;
      };

      /**
       * @ngdoc function
       * @name resource.Resource.queryUrl
       * @propertyOf resource.Resource
       * @description
       * Query a specific URL to get a `ResourceCollection` (which contains
       * `Resource`s).
       *
       * @param {string} url    The URL to query
       * @param {Object} params Additional URL parameters
       * @returns {promise|ResourceCollection} Instance of `ResourceCollection`
       */
      Resource.queryUrl = function(url, params) {
        var _self = this;
        var promise = $http.get(url, params ? {params:params} : undefined)
            .then(function(response) {
              return _self.transformCollectionResponse(response);
            });
        return successErrorPromise(promise);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.query
       * @propertyOf resource.Resource
       * @description
       * Query the default endpoint URL, given by `getCollectionUrl()` to get
       * an instance of `ResourceCollection`.
       *
       * @param {Object} params Additional URL paramters
       * @returns {promise|ResourceCollection} Instance of `ResourceCollection`
       */
      Resource.query = function(params) {
        return this.queryUrl(this.prototype.getCollectionUrl(), params);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.getUrl
       * @propertyOf resource.Resource
       * @description
       * Get one `Resource` from a specific URL.
       *
       * @param {string} url The URL to get from
       * @param {Object} params Additional URL parameters
       * @returns {promise|Resource} Instance of `Resource`
       */
      Resource.getUrl = function(url, params) {
        var _self = this;
        var promise = $http.get(url, params ? {params:params} : undefined)
            .then(function(response) {
              return _self.transformItemResponse(response);
            });
        return successErrorPromise(promise);
      };

      /**
       * @ngdoc function
       * @name resource.Resource.get
       * @propertyOf resource.Resource
       * @description
       * Get one resource given by its primary field, `_primaryField`.
       *
       * @param {string} id   The primary field of the `Resource` to get
       * @param {Object} params Additional URL parameters
       * @returns {Resource} Instance of `Resource`
       */
      Resource.get = function(id, params) {
        return this.getUrl(this.prototype.getResourceUrl(id), params);
      };

      /**
       * @ngdoc method
       * @name resource.Resource.isNew
       * @methodOf resource.Resource
       * @description
       * Determines if the `Resource` is "new", i.e. it doesn't exist on the
       * API.
       *
       * @returns {bool} True if the `Resource` is new.
       */
      Resource.prototype.isNew = function() {
        return !((this._primaryField in this) &&
            angular.isDefined(this[this._primaryField]));
      };

      /**
       * @ngdoc method
       * @name resource.Resource.update
       * @methodOf resource.Resource
       * @description
       * Update the `Resource` with new data from the object passed in.
       *
       * @param {Object} data Object with new data.
       */
      Resource.prototype.update = function(data) {
        angular.extend(this, data);
      };

      /**
       * @ngdoc method
       * @name resource.Resource.save
       * @methodOf resource.Resource
       * @description
       * Saves the `Resource` to the API, via a POST to the collection endpoint
       * if the `Resource` is new, or a PUT to the item endpoint if not.
       *
       * Also updates the `Resource` with any data given from the API response.
       *
       * @returns {promise|Resource} New `Resource` based on data from the API.
       */
      Resource.prototype.save = function() {
        var promise,
            _self = this,
            isNew = this.isNew();

        var config = {};
        config.headers = isNew ? angular.copy(provider.headers.post) :
            angular.copy(provider.headers.put);

        var data = this.transformItemRequest(config.headers);

        if (this.isNew()) {
          promise = $http.post(this.getCollectionUrl(), data, config);
        } else {
          promise = $http.put(this.getResourceUrl(), data, config);
        }

        promise.then(function(response) {
          // @TODO: iff there is any data?
          _self.update(response.data);
        });

        return successErrorPromise(promise);
      };

      /**
       * @ngdoc method
       * @name resource.Resource.delete
       * @methodOf resource.Resource
       * @description
       * Delete the `Resource` on the API side with a DELETE to the item
       * endpoint.
       *
       * @returns {promise} Promise with data form the API.
       */
      Resource.prototype.delete = function() {
        if (!this.isNew()) {
          var config = {};
          config.headers = angular.copy(provider.headers.delete);
          this.transformItemRequest(config.headers);
          return successErrorPromise($http.delete(this.getResourceUrl(),
              config));
        } else {
          var deferred = $q.defer();
          deferred.resolve({});
          return successErrorPromise(deferred.promise);
        }
      };

      return Resource;
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