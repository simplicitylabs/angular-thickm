'use strict';

angular.module('thickm.resource')
.provider('resourceFactory', function ResourceFactoryProvider() {

  var provider = this;

  this.setBaseUrl = function(baseUrl) {
    this.baseUrl = baseUrl;
  };

  this.headers = {
    post: {
      'Content-Type': 'application/json'
    },
    put: {
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
    function resourceFactory() {

      function Resource() {
      }

      Resource.prototype._resourceName = 'item';
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

      Resource.prototype.getCollectionUrl = function() {
        return provider.baseUrl + this._resourceName;
      };

      Resource.prototype.getResourceUrl = function(id) {
        return this.getCollectionUrl() + '/' + (id || this[this._primaryField]);
      };

      Resource.transformCollectionResponse = function(response) {
        return this._collectionClass.build(this, response);
      };

      Resource.transformItemResponse = function(response) {
        return this.build(response.data);
      };

      Resource.prototype.transformItemRequest = function() {
        return this;
      };

      Resource.query = function(params) {
        var _self = this;
        var promise = $http.get(this.prototype.getCollectionUrl(), {
              params: params ? params : null
            })
            .then(function(response) {
              return _self.transformCollectionResponse(response);
            });
        return successErrorPromise(promise);
      };

      Resource.get = function(id, params) {
        var _self = this;
        var promise = $http.get(this.prototype.getResourceUrl(id), {
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
            _self = this,
            isNew = this.isNew();

        var config = {};
        config.headers = isNew ? provider.headers.post : provider.headers.put;

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

      Resource.prototype.delete = function() {
        if (!this.isNew()) {
          return $http.delete(this.getCollectionUrl() + '/' +
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

    return resourceFactory;
  };
});
