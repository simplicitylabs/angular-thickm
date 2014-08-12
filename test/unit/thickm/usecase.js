'use strict';

var faker = window.faker;
Math.seedrandom('thikcm');

// Function to generate random user data
function randomUserData() {
  return {
    _id: faker.Helpers.replaceSymbolWithNumber('###############', '#'),
    username: faker.Internet.userName(),
  };
}

var usersModule = angular.module('users', ['thickm']);

(function() {
  var baseUrl = 'http://coolapp.com/api/v1/';
  var resourceName = 'users';

  var collectionUrl = baseUrl + resourceName;
  var userCollectionData = {
    _items: Array.apply(null, new Array(25)).map(randomUserData),
    _meta: { total: 73, page: 1, max_results: 25 }
  };
  var knownUserData = userCollectionData._items[0];
  var knownUserUrl = collectionUrl + '/' + knownUserData._id;

  usersModule.value('testData', {
    baseUrl: baseUrl,
    resourceName: resourceName,
    collectionUrl: collectionUrl,
    userCollectionData: userCollectionData,
    knownUserData: knownUserData,
    knownUserUrl: knownUserUrl
  });

  usersModule.value('configureHttpBackend', function($httpBackend) {
    var escCollectionUrl = collectionUrl.replace(/[\/]/g, '\\/');

    function postData() {
      return true;
    }

    function postHeaders() {
      // var json = headers['Content-Type'] === 'application/json';
      // if (!json) {
      //   console.warn('Wrong headers ' + headers['Content-Type'], headers);
      // }
      // return json;
      return true;
    }

    $httpBackend.whenGET(new RegExp(escCollectionUrl + '(\\?.*)?$')).
        respond(function() {
          return [200, JSON.stringify(userCollectionData), {}, 'OK'];
        });

    angular.forEach(userCollectionData._items, function(userData) {
      $httpBackend.whenGET(new RegExp(escCollectionUrl + '\/' + userData._id +
          '(\\?.*)?$'))
          .respond(function() {
            return [200, JSON.stringify(userData), {}, 'OK'];
          });
    });

    $httpBackend.whenPUT(collectionUrl + '/' + knownUserData._id, postData, postHeaders)
        .respond(function(method, url, data) {
          return [200, JSON.stringify(data), {}, 'OK'];
        });

    $httpBackend.whenPOST(collectionUrl, postData, postHeaders).respond(function() {
      return [201, JSON.stringify(knownUserData), {}, 'Created'];
    });

    $httpBackend.whenDELETE(collectionUrl + '/' + knownUserData._id)
        .respond(function() {
          return [200, '', {}, 'OK'];
        });
  });
})();

// Config sep
usersModule.config(function(resourceFactoryProvider) {
  resourceFactoryProvider.setBaseUrl('http://coolapp.com/api/v1/');
});

// Define ApiCollection factory
usersModule.factory('MyAPICollection', function(ResourceCollection) {
  function MyAPICollection() {

  }
  ResourceCollection.collectionInit(MyAPICollection);
  MyAPICollection._itemsField = '_items';
  MyAPICollection._metaField = '_meta';

  MyAPICollection.prototype.hasNext = function() {
    return this._meta.page * this._meta.max_results < this._meta.total;
  };

  return MyAPICollection;
});

// Define users factory
usersModule.factory('User', function(resourceFactory, MyAPICollection) {

  function User(data) {
    this._primaryField = '_id';
    angular.extend(this, data);
  }
  resourceFactory.resourceInit(User, 'users');
  User._collectionClass = MyAPICollection;

  // Instance methods
  User.prototype.fullName = function() {
    return 'full name';
  };

  // Overwrite inherited static methods
  User.validate = function() {
    return true;
  };
  return User;
});
