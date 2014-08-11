'use strict';

angular.module('thickm.resource')
.provider('resourceFactory', function ResourceFactoryProvider() {

  var provider = this;

  this.setBaseUrl = function(baseUrl) {
    this.baseUrl = baseUrl;
  };

  this.$get = function($http) {
    function resourceFactory(collectionName) {

      function Resource() {
      }

      Resource.prototype.instance = function() {
        return 'instance';
      };

      Resource.prototype._primaryField = 'id';

      Resource.getClassName = function() {
        return this.className;
      };

      Resource.static = function() {
        return 'static';
      };

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

      Resource.query = function() {
        var _self = this; // Item
        return $http.get(provider.baseUrl + collectionName)
            .then(function(response) {
              return _self.transformCollectionResponse(response);
            });
      };

      Resource.get = function(id) {
        var _self = this;
        return $http.get(provider.baseUrl + collectionName + '/' + id)
            .then(function(response) {
              return _self.transformItemResponse(response);
            });
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
          promise = $http.post(provider.baseUrl + collectionName);
        } else {
          promise = $http.put(provider.baseUrl + collectionName + '/' +
              this[this._primaryField]);
        }
        return promise.then(function(response) {
          // @TODO: iff there is any data?
          _self.update(response.data);
        });
      };

      Resource.prototype.delete = function() {
        if (!this.isNew()) {
          return $http.delete(provider.baseUrl + collectionName + '/' +
            this[this._primaryField]);
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

    resourceFactory.itemFactory = function(collectionName) {
      console.warn('itemFactory is deprecated, use resourceInit.');
      var Resource = resourceFactory(collectionName);

      function Item(data) {
        angular.extend(this, data);
      }

      Item.prototype = new Resource();
      angular.extend(Item, Resource);

      Item.transformCollectionResponse = function(self, response) {
        return response.data.map(function(item) {
          return self.build(item);
        });
      };

      return Item;
    };

    return resourceFactory;
  };
});
