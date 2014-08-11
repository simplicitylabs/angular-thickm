'use strict';

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

  this.$get = function($http, $q) {
    function resourceFactory(resourceName) {

      var resourceUrl = provider.baseUrl + resourceName;

      function Resource() {
      }

      Resource.prototype._primaryField = 'id';

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
        var Self = this;
        return response.data.map(function(item) {
          return Self.build(item);
        });
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

    resourceFactory.extend = function(subclass, superclass) {
      var Tmp = function() {};
      Tmp.prototype = superclass.prototype;
      subclass.prototype = new Tmp();
      subclass.prototype.constructor = subclass;
    };

    resourceFactory.resourceInit = function(subclass, resourceName) {
      var Resource = resourceFactory(resourceName);
      resourceFactory.extend(subclass, Resource);
      angular.extend(subclass, Resource);
    };

    return resourceFactory;
  };
});
