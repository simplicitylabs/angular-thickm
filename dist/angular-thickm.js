(function(window, document) {
  'use strict';
// Source: src/thickm/collection/collection.module.js
angular.module('thickm.collection', ['thickm.util']);
// Source: src/thickm/model/model.module.js
/**
 * @ngdoc module
 * @name model
 * @description
 *
 * ## Model
 *
 * This module houses the Model provider, which is the main class of the
 * library.
 */
angular.module('thickm.model', ['thickm.collection', 'thickm.util']);
// Source: src/thickm/thickm.module.js
angular.module('thickm', [
  'thickm.model',
  'thickm.collection'
]);
// Source: src/thickm/util/util.module.js
angular.module('thickm.util', []);
// Source: src/thickm/model/model.provider.js
/**
 * @ngdoc service
 * @name model.ThickModelProvider
 * @description
 *
 * The main provider for the library, which provides the ThickModel factory.
 */
angular.module('thickm.model')
.provider('ThickModel', function ThickModelProvider() {

  var provider = this;

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

  this.$get = function($http, $q, ThickModelCollection, ThickmUtil) {

      /**
       * @ngdoc service
       * @class
       * @name model.ThickModel
       * @description
       *
       * Constructor for the `Model` class, which is the main point of entry
       * for this library. This is the main class to subclass in order to create
       * models for an application, or to create an API-specific super class.
       *
       * @param {Object} data Data to create the `Model` from, will be come
       *                      properties of the new `Model` object.
       */
      function ThickModel(data) {
        angular.extend(this, data);
      }

      // The base URL for the model, e.g. `/api/v1/`
      ThickModel.prototype._baseUrl = '';

      // The endpoint name, i.e. 'items' in `/api/v1/items`
      ThickModel.prototype._modelName = 'items';

      // The field of an item to do lookups by
      ThickModel.prototype._primaryField = 'id';

      // The ThickModel's collection class, i.e. the class used to represent a
      // collection of items.
      ThickModel._collectionClass = ThickModelCollection;

      /**
       * @ngdoc function
       * @name model.ThickModel.build
       * @propertyOf model.ThickModel
       * @description
       * ThickModel factory method. Takes data object and uses the `ThickModel`
       * constructor to create a new `ThickModel`.
       *
       * @param  {Object} data Data for the new ThickModel.
       * @return {ThickModel} new ThickModel
       */
      ThickModel.build = function(data) {
        return new this(data);
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.prototype.getCollectionUrl
       * @methodOf model.ThickModel
       * @description
       * Get the collection URL, e.g. `http://example.com/api/v1/users`. Uses
       * base API URl from `_baseUrl` and `_modelName`.
       *
       * @return {string} The collection URL
       */
      ThickModel.prototype.getCollectionUrl = function() {
        return (this._baseUrl || '/') + this._modelName;
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.prototype.getModelUrl
       * @methodOf model.ThickModel
       * @description
       * Get the model URL, e.g. `http://example.com/api/v1/users/1337`. Uses
       * `getCollectionUrl()` and `_primaryField`.
       *
       * @param {string} id The ID of the model for which to get the URL
       * @returns {string} The model URL
       */
      ThickModel.prototype.getModelUrl = function(id) {
        return this.getCollectionUrl() + '/' + (id || this[this._primaryField]);
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.transformCollectionResponse
       * @methodOf model.ThickModel
       * @description
       * Transform an collection response into an object. Uses the collection
       * class' `build` method to create a collection from the HTTP response.
       *
       * @param {Object<response>} response Response object from `$http`
       * @returns {Object<collection class>} Collection class instance
       */
      ThickModel.transformCollectionResponse = function(response) {
        return this._collectionClass.build(this, response);
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.transformItemResponse
       * @propertyOf model.ThickModel
       * @description
       * Transform an item response into an object. Uses the `build` method to
       * create an instance of `ThickModel` from the HTTP response.
       *
       * @param {Object<response>} response Response object form `$http`.
       * @returns {ThickModel} ThickModel
       */
      ThickModel.transformItemResponse = function(response) {
        return this.build(response.data);
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.prototype.transformItemRequest
       * @methodOf model.ThickModel
       * @description
       * Transform an item request. This is also where the headers for a
       * request can be altered in a subclass.
       *
       * @param {Object} headers Headers object
       * @returns {Object} Object which is sent to API.
       */
      /*jshint unused:false */
      ThickModel.prototype.transformItemRequest = function(headers) {
        return this;
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.queryUrl
       * @propertyOf model.ThickModel
       * @description
       * Query a specific URL to get a `ThickModelCollection` (which contains
       * `Model`s).
       *
       * @param {string} url    The URL to query
       * @param {Object} params Additional URL parameters
       * @returns {promise|ThickModelCollection} Instance of
       * `ThickModelCollection`
       */
      ThickModel.queryUrl = function(url, params) {
        var _self = this;
        var promise = $http.get(url, params ? {params:params} : undefined)
            .then(function(response) {
              return _self.transformCollectionResponse(response);
            });
        return successErrorPromise(promise);
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.query
       * @propertyOf model.ThickModel
       * @description
       * Query the default endpoint URL, given by `getCollectionUrl()` to get
       * an instance of `ThickModelCollection`.
       *
       * @param {Object} params Additional URL paramters
       * @returns {promise|ThickModelCollection} Instance of
       * `ThickModelCollection`
       */
      ThickModel.query = function(params) {
        return this.queryUrl(this.prototype.getCollectionUrl(), params);
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.getUrl
       * @propertyOf model.ThickModel
       * @description
       * Get one `ThickModel` from a specific URL.
       *
       * @param {string} url The URL to get from
       * @param {Object} params Additional URL parameters
       * @returns {promise|ThickModel} Instance of `ThickModel`
       */
      ThickModel.getUrl = function(url, params) {
        var _self = this;
        var promise = $http.get(url, params ? {params:params} : undefined)
            .then(function(response) {
              return _self.transformItemResponse(response);
            });
        return successErrorPromise(promise);
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.get
       * @propertyOf model.ThickModel
       * @description
       * Get one model given by its primary field, `_primaryField`.
       *
       * @param {string} id   The primary field of the `ThickModel` to get
       * @param {Object} params Additional URL parameters
       * @returns {ThickModel} Instance of `ThickModel`
       */
      ThickModel.get = function(id, params) {
        return this.getUrl(this.prototype.getModelUrl(id), params);
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.isNew
       * @methodOf model.ThickModel
       * @description
       * Determines if the `ThickModel` is "new", i.e. it doesn't exist on the
       * API.
       *
       * @returns {bool} True if the `ThickModel` is new.
       */
      ThickModel.prototype.isNew = function() {
        return !((this._primaryField in this) &&
            angular.isDefined(this[this._primaryField]));
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.update
       * @methodOf model.ThickModel
       * @description
       * Update the `ThickModel` with new data from the object passed in.
       *
       * @param {Object} data Object with new data.
       */
      ThickModel.prototype.update = function(data) {
        angular.extend(this, data);
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.save
       * @methodOf model.ThickModel
       * @description
       * Saves the `ThickModel` to the API, via a POST to the collection
       * endpoint if the `ThickModel` is new, or a PUT to the item endpoint if
       * not.
       *
       * Also updates the `ThickModel` with any data given from the API
       * response.
       *
       * @returns {promise|ThickModel} New `ThickModel` based on data from the
       * API.
       */
      ThickModel.prototype.save = function() {
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
          promise = $http.put(this.getModelUrl(), data, config);
        }

        promise.then(function(response) {
          // @TODO: iff there is any data?
          _self.update(response.data);
        });

        return successErrorPromise(promise);
      };

      /**
       * @ngdoc method
       * @name model.ThickModel.delete
       * @methodOf model.ThickModel
       * @description
       * Delete the `ThickModel` on the API side with a DELETE to the item
       * endpoint.
       *
       * @returns {promise} Promise with data form the API.
       */
      ThickModel.prototype.delete = function() {
        if (!this.isNew()) {
          var config = {};
          config.headers = angular.copy(provider.headers.delete);
          this.transformItemRequest(config.headers);
          return successErrorPromise($http.delete(this.getModelUrl(),
              config));
        } else {
          var deferred = $q.defer();
          deferred.resolve({});
          return successErrorPromise(deferred.promise);
        }
      };

      /**
       * @ngdoc function
       * @name model.ThickModel.extend
       * @propertyOf model.ThickModel
       * @description
       * Extend this class with both static and prototype. Example:
       *
       * ```javascript
       * function MyClass(data) {
       *   ThickModel.call(this, data);
       * }
       *
       * ThickModel.extend(MyClass);
       * ```
       */
      ThickModel.extend = function(subclass) {
        ThickmUtil.extend(subclass, this);
        angular.extend(subclass, this);
      };

      return ThickModel;
    };

});
// Source: src/thickm/collection/collection.factory.js
angular.module('thickm.collection')
.factory('ThickModelCollection',
    function ThickModelCollectionFactory(ThickmUtil) {

  /**
   * @ngdoc service
   * @class
   * @name model.ThickModelCollection
   * @description
   *
   * Constructor for the `ThickModelCollection` class, which is used to
   * represent collections of `ThickModel`s. The class is based on `Array` and
   * can thus be iterated over and inherits its methods.
   */
  function ThickModelCollection() {
    Array.apply(this, arguments);
  }
  ThickmUtil.extend(ThickModelCollection, Array);

  // The field in responses which holds items (which will be converted to
  // models)
  ThickModelCollection._itemsField = null;

  // The field in responses which holds meta data
  ThickModelCollection._metaField = 'meta';

  /**
   * @ngdoc function
   * @name model.ThickModelCollection.itemsFromResponse
   * @propertyOf model.ThickModelCollection
   * @description
   * Given a `ThickModel` class, create an array of instances from a response.
   *
   * @param {Class} cls The `ThickModel` class to use
   * @param {object} response Response from `$http`
   * @returns {Array<cls>} Array of instances
   */
  ThickModelCollection.itemsFromResponse = function(cls, response) {
    var data = this._itemsField ?
        response.data[this._itemsField] : response.data;
    return data.map(function(item) { return cls.build(item); });
  };

  /**
   * @ngdoc function
   * @name model.ThickModelCollection.metaFromResponse
   * @propertyOf model.ThickModelCollection
   * @description
   * Given a `ThickModel` class, create an object holding meta data from a
   * response.
   *
   * @param {Class} cls The `ThickModel` class to use
   * @param {object} response Response from `$http`
   * @returns {object} Object holding meta data
   */
  ThickModelCollection.metaFromResponse = function(cls, response) {
    return this._metaField ? response.data[this._metaField] : {};
  };

  /**
   * @ngdoc function
   * @name model.ThickModelCollection.build
   * @propertyOf model.ThickModelCollection
   * @description
   * Given a `ThickModel` class, create a `ThickModelCollection` instance from a
   * response.
   *
   * @param {Class} cls The `ThickModel` class to use
   * @param {object} response Response from `$http`
   * @returns {Array<cls>} Array of instances
   */
  ThickModelCollection.build = function(cls, response) {
    var rc = new this();

    rc._modelClass = cls;

    var items = this.itemsFromResponse(cls, response);
    angular.forEach(items, function(item) {
      rc.push(item);
    });

    rc._meta = this.metaFromResponse(cls, response);

    return rc;
  };

  /**
   * @ngdoc function
   * @name model.ThickModelCollection.extend
   * @propertyOf model.ThickModelCollection
   * @description
   * Extend this class with both static and prototype. Example:
   *
   * ```javascript
   * function MyClass() {
   *   ThickModelCollection.call(this, arguments);
   * }
   *
   * ThickModelCollection.extend(MyClass);
   * ```
   */
  ThickModelCollection.extend = function(subclass) {
    ThickmUtil.extend(subclass, this);
    angular.extend(subclass, this);
  };

  return ThickModelCollection;

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