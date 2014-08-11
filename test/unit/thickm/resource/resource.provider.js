'use strict';

var faker = window.faker;
Math.seedrandom('thikcm');

/**
 * Custom matchers
 */
beforeEach(function() {
  this.addMatchers({
    toBeSuccessErrorPromise: function() {
      var isPromise = angular.isObject(this.actual) &&
          angular.isFunction(this.actual.then) &&
          angular.isFunction(this.actual.catch) &&
          angular.isFunction(this.actual.finally) &&
          angular.isFunction(this.actual.success) &&
          angular.isFunction(this.actual.error);

      this.message = function() {
        if (isPromise) {
          return 'Is a S/E promise.';
        } else {
          return angular.isObject(this.actual) ?
              'Is not a S/E promise, has keys: ' + Object.keys(this.actual) :
              'Is not a S/E promise, nor an object';
        }
      };

      return isPromise;
    }
  });
});

/**
 * Provider tests
 */
describe('thickm resourceFactoryProvider', function() {

  var provider;

  beforeEach(function() {
    var fakeModule = angular.module('fakeModule', function() {});
    fakeModule.config(function(resourceFactoryProvider) {
      provider = resourceFactoryProvider;
    });

    module('thickm.resource', 'fakeModule');

    inject(function() {});
  });

  it('can set base url', function() {
    var baseUrl = 'http://example.com/api/';
    expect(provider).not.toBeUndefined();
    provider.setBaseUrl(baseUrl);
    expect(provider.$get().baseUrl).toEqual(baseUrl);
  });
});

/**
 * Factory tests
 */
describe('thickm resourceFactory', function() {

  beforeEach(module('thickm.resource'));

  var resourceFactory;
  beforeEach(inject(function(_resourceFactory_) {
    resourceFactory = _resourceFactory_;
  }));

});

/**
 * Use case
 */
describe('User use case', function() {

  // Function to generate random user data
  function randomUserData() {
    return {
      _id: faker.Helpers.replaceSymbolWithNumber('###############', '#'),
      username: faker.Internet.userName(),
    };
  }

  var resourceName = 'users';
  var baseUrl = 'http://coolapp.com/api/v1/';
  var collectionUrl = baseUrl + resourceName;
  var userCollectionData = Array.apply(null, new Array(25)).map(randomUserData);
  var knownUserData = userCollectionData[0];
  var knownUserUrl = collectionUrl + '/' + knownUserData._id;
  var $httpBackend;

  // Set up the module to test
  beforeEach(function() {
    var usersModule = angular.module('users', ['thickm.resource']);

    // Config sep
    usersModule.config(function(resourceFactoryProvider) {
      resourceFactoryProvider.setBaseUrl(baseUrl);
    });

    // Define users factory
    usersModule.factory('User', function(resourceFactory) {

      function User(data) {
        this._primaryField = '_id';
        angular.extend(this, data);
      }

      resourceFactory.resourceInit(User, 'users');

      // Instance methods
      User.prototype.fullName = function() {
        return 'full name';
      };

      // Overwrite inherited static methods
      User.validate = function() {
        return true;
      };

      // Custom static methods

      return User;
    });

    module('thickm.resource', 'users');
    inject(function() {});
  });

  // Set up $httpBackend
  beforeEach(inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;

    var escCollectionUrl = collectionUrl.replace(/[\/]/g, '\\/');
    // var regex = new RegExp(escCollectionUrl + '(\\?.*)?$');
    //
    // console.log(
    //   regex.test('http://coolapp.com/api/v1/users?sort=%5B%5B%22partnumber%22,1%5D%5D'),
    //   regex.test('http://coolapp.com/api/v1/users'),
    //   regex.test('http://coolapp.com/api/v1/users/1'));

    $httpBackend.whenGET(new RegExp(escCollectionUrl + '(\\?.*)?$')).
        respond(function() {
          return [200, JSON.stringify([userCollectionData]), {}, 'OK'];
        });

    angular.forEach(userCollectionData, function(userData) {
      $httpBackend.whenGET(new RegExp(escCollectionUrl + '\/' + userData._id +
          '(\\?.*)?$'))
          .respond(function() {
            return [200, JSON.stringify(userData), {}, 'OK'];
          });
    });

    $httpBackend.whenPUT(collectionUrl + '/' + knownUserData._id)
        .respond(function(method, url, data) {
          return [200, JSON.stringify(data), {}, 'OK'];
        });

    $httpBackend.whenPOST(collectionUrl).respond(function() {
      return [201, JSON.stringify(knownUserData), {}, 'Created'];
    });

    $httpBackend.whenDELETE(collectionUrl + '/' + knownUserData._id)
        .respond(function() {
          return [200, '', {}, 'OK'];
        });
  }));

  describe('User class', function() {
    var User;
    beforeEach(inject(function(_User_) {
      User = _User_;
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('exists and is Resource constructor', function() {
      expect(User).not.toBeUndefined();
      expect((new User()) instanceof User).toEqual(true);
      expect(User.query).not.toBeUndefined();
    });

    describe('query method', function() {
      it('should query baseUrl/users', function() {
        $httpBackend.expectGET(collectionUrl);
        expect(User.query()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return an array of user instances', function() {
        $httpBackend.expectGET(collectionUrl);
        var promise = User.query();
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(users) {
          expect(angular.isArray(users)).toEqual(true);
          expect(users.length).toBeGreaterThan(0);
          angular.forEach(users, function(user) {
            expect(user instanceof User).toEqual(true);
            expect(user.fullName).not.toBeUndefined();
          });
        });
        $httpBackend.flush();
      });

      it('should validate users from API', function() {
        $httpBackend.expectGET(collectionUrl);
        spyOn(User, 'validate').andCallThrough();
        var users;
        var promise = User.query();
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(_users) {
          users = _users;
        });
        $httpBackend.flush();
        expect(User.validate).toHaveBeenCalled();
        expect(User.validate.calls.length).toEqual(users.length);
      });

      it('should set query parameters', function() {
        $httpBackend.expectGET(collectionUrl +
            '?sort=%5B%5B%22partnumber%22,1%5D%5D');
        User.query({sort: JSON.stringify([['partnumber', 1]])});
        $httpBackend.flush();
      });
    });

    describe('get method', function() {
      it('should query baseUrl/users/:_id', function() {
        $httpBackend.expectGET(knownUserUrl);
        expect(User.get(knownUserData._id)).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return an user instance', function() {
        $httpBackend.expectGET(knownUserUrl);
        var promise = User.get(knownUserData._id);
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(user) {
          expect(user instanceof User).toEqual(true);
          expect(user.username).toEqual(knownUserData.username);
        });
        $httpBackend.flush();
      });

      it('should validate user from API', function() {
        $httpBackend.expectGET(knownUserUrl);
        spyOn(User, 'validate').andCallThrough();
        expect(User.get(knownUserData._id)).toBeSuccessErrorPromise();
        $httpBackend.flush();
        expect(User.validate).toHaveBeenCalled();
      });

      it('should set query parameters', function() {
        $httpBackend.expectGET(knownUserUrl + '?embedded=%7B%22groups%22:1%7D');
        User.get(knownUserData._id, { embedded: { groups: 1 }});
        $httpBackend.flush();
      });
    });

    describe('isNew instance method', function() {
      it('returns true when user has no _id', function() {
        var user = User.build(knownUserData);
        user._id = undefined;
        expect(user.isNew()).toEqual(true);
      });

      it('returns false when user has _id', function() {
        var user = User.build(knownUserData);
        expect(user.isNew()).toEqual(false);
      });
    });

    describe('save method', function() {
      var user, newUser;

      beforeEach(function() {
        user = User.build(knownUserData);
        var newUserData = angular.copy(knownUserData);
        newUserData._id = undefined;
        newUser = User.build(newUserData);
      });

      it('puts known user to users/:_id', function() {
        $httpBackend.expectPUT(knownUserUrl);
        expect(user.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('posts new user to users/', function() {
        $httpBackend.expectPOST(collectionUrl);
        expect(newUser.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('updates id field when posting new user if possible', function() {
        $httpBackend.expectPOST(collectionUrl);
        expect(newUser.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
        expect(newUser._id).not.toBeUndefined();
        expect(newUser._id).toEqual(user._id);
      });
    });

    describe('delete method', function() {
      var user;

      beforeEach(function() {
        user = User.build(knownUserData);
      });

      it('deletes known users to users/:_id', function() {
        $httpBackend.expectDELETE(knownUserUrl);
        expect(user.delete()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('noops on unknown users', function() {
        user._id = undefined;
        expect(user.delete()).toBeSuccessErrorPromise();
        // $httpBackend causes error if request was sent
      });
    });
  });

});
