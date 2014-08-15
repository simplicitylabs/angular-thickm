'use strict';

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
    fakeModule.config(function(ResourceProvider) {
      provider = ResourceProvider;
    });

    module('thickm.resource', 'fakeModule');

    inject(function() {});
  });

  it('can set base url', function() {
    var baseUrl = 'http://example.com/api/';
    expect(provider).not.toBeUndefined();
    provider.setBaseUrl(baseUrl);
    expect(provider.baseUrl).toEqual(baseUrl);
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
  var $httpBackend;
  var MyAPICollection;

  // Set up the module to test
  beforeEach(function() {
    module('thickm.resource', 'users');
    inject(function() {});
  });

  // Set up $httpBackend
  beforeEach(inject(function(_$httpBackend_, configureHttpBackend) {
    $httpBackend = _$httpBackend_;
    configureHttpBackend($httpBackend);
  }));

  beforeEach(inject(function(_MyAPICollection_) {
    MyAPICollection = _MyAPICollection_;
  }));

  describe('User class', function() {
    var User, testData;
    beforeEach(inject(function(_User_, _testData_) {
      User = _User_;
      testData = _testData_;
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
        $httpBackend.expectGET(testData.collectionUrl);
        expect(User.query()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return a MyAPICollection with User instances', function() {
        $httpBackend.expectGET(testData.collectionUrl);
        var promise = User.query();
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(collection) {
          expect(collection instanceof MyAPICollection).toEqual(true);
          expect(collection.length).toEqual(25);
          angular.forEach(collection, function(user) {
            expect(user instanceof User).toEqual(true);
            expect(user.fullName).not.toBeUndefined();
          });
        });
        $httpBackend.flush();
      });

      it('should validate users from API', function() {
        $httpBackend.expectGET(testData.collectionUrl);
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
        $httpBackend.expectGET(testData.collectionUrl +
            '?sort=%5B%5B%22partnumber%22,1%5D%5D');
        User.query({sort: JSON.stringify([['partnumber', 1]])});
        $httpBackend.flush();
      });
    });

    describe('queryUrl method', function() {
      it('should query specified collection url', function() {
        $httpBackend.expectGET(testData.specifiedCollectionUrl);
        expect(User.queryUrl(testData.specifiedCollectionUrl))
            .toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return a MyAPICollection with User instances', function() {
        $httpBackend.expectGET(testData.specifiedCollectionUrl);
        var promise = User.queryUrl(testData.specifiedCollectionUrl);
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(collection) {
          expect(collection instanceof MyAPICollection).toEqual(true);
          expect(collection.length).toEqual(25);
          angular.forEach(collection, function(user) {
            expect(user instanceof User).toEqual(true);
            expect(user.fullName).not.toBeUndefined();
          });
        });
        $httpBackend.flush();
      });

      it('should validate users from API', function() {
        $httpBackend.expectGET(testData.specifiedCollectionUrl);
        spyOn(User, 'validate').andCallThrough();
        var users;
        var promise = User.queryUrl(testData.specifiedCollectionUrl);
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(_users) {
          users = _users;
        });
        $httpBackend.flush();
        expect(User.validate).toHaveBeenCalled();
        expect(User.validate.calls.length).toEqual(users.length);
      });

      it('should set query parameters', function() {
        $httpBackend.expectGET(testData.specifiedCollectionUrl +
            '?sort=%5B%5B%22partnumber%22,1%5D%5D');
        User.queryUrl(testData.specifiedCollectionUrl,
              {sort: JSON.stringify([['partnumber', 1]])});
        $httpBackend.flush();
      });
    });

    describe('get method', function() {
      it('should query baseUrl/users/:_id', function() {
        $httpBackend.expectGET(testData.knownUserUrl);
        expect(User.get(testData.knownUserData._id)).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return an user instance', function() {
        $httpBackend.expectGET(testData.knownUserUrl);
        var promise = User.get(testData.knownUserData._id);
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(user) {
          expect(user instanceof User).toEqual(true);
          expect(user.username).toEqual(testData.knownUserData.username);
        });
        $httpBackend.flush();
      });

      it('should validate user from API', function() {
        $httpBackend.expectGET(testData.knownUserUrl);
        spyOn(User, 'validate').andCallThrough();
        expect(User.get(testData.knownUserData._id)).toBeSuccessErrorPromise();
        $httpBackend.flush();
        expect(User.validate).toHaveBeenCalled();
      });

      it('should set query parameters', function() {
        $httpBackend.expectGET(testData.knownUserUrl + '?embedded=%7B%22groups%22:1%7D');
        User.get(testData.knownUserData._id, { embedded: { groups: 1 }});
        $httpBackend.flush();
      });
    });

    describe('getUrl method', function() {
      it('should query someurl', function() {
        $httpBackend.expectGET(testData.specifiedItemUrl);
        expect(User.getUrl(testData.specifiedItemUrl)).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('should return an user instance', function() {
        $httpBackend.expectGET(testData.specifiedItemUrl);
        var promise = User.getUrl(testData.specifiedItemUrl);
        expect(promise).toBeSuccessErrorPromise();
        promise.then(function(user) {
          expect(user instanceof User).toEqual(true);
          expect(user.username).toEqual(testData.knownUserData.username);
        });
        $httpBackend.flush();
      });

      it('should validate user from API', function() {
        $httpBackend.expectGET(testData.specifiedItemUrl);
        spyOn(User, 'validate').andCallThrough();
        expect(User.getUrl(testData.specifiedItemUrl)).toBeSuccessErrorPromise();
        $httpBackend.flush();
        expect(User.validate).toHaveBeenCalled();
      });

      it('should set query parameters', function() {
        $httpBackend.expectGET(testData.specifiedItemUrl + '?embedded=%7B%22groups%22:1%7D');
        User.getUrl(testData.specifiedItemUrl, { embedded: { groups: 1 }});
        $httpBackend.flush();
      });
    });

    describe('isNew instance method', function() {
      it('returns true when user has no _id', function() {
        var user = User.build(testData.knownUserData);
        user._id = undefined;
        expect(user.isNew()).toEqual(true);
      });

      it('returns false when user has _id', function() {
        var user = User.build(testData.knownUserData);
        expect(user.isNew()).toEqual(false);
      });
    });

    describe('save method', function() {
      var user, newUser;

      beforeEach(function() {
        user = User.build(testData.knownUserData);
        var newUserData = angular.copy(testData.knownUserData);
        newUserData._id = undefined;
        newUser = User.build(newUserData);
      });

      it('puts known user to users/:_id', function() {
        $httpBackend.expectPUT(testData.knownUserUrl);
        expect(user.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('posts new user to users/', function() {
        $httpBackend.expectPOST(testData.collectionUrl);
        expect(newUser.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('transforms the object when posting new', function() {
        $httpBackend.expectPOST(testData.collectionUrl);
        spyOn(newUser, 'transformItemRequest');
        newUser.save();
        expect(newUser.transformItemRequest).toHaveBeenCalled();
        $httpBackend.flush();
      });

      it('transforms the object when saving old', function() {
        $httpBackend.expectPUT(testData.knownUserUrl);
        spyOn(user, 'transformItemRequest');
        user.save();
        expect(user.transformItemRequest).toHaveBeenCalled();
        $httpBackend.flush();
      });

      it('updates id field when posting new user if possible', function() {
        $httpBackend.expectPOST(testData.collectionUrl);
        expect(newUser.save()).toBeSuccessErrorPromise();
        $httpBackend.flush();
        expect(newUser._id).not.toBeUndefined();
        expect(newUser._id).toEqual(user._id);
      });
    });

    describe('delete method', function() {
      var user;

      beforeEach(function() {
        user = User.build(testData.knownUserData);
      });

      it('deletes known users to users/:_id', function() {
        $httpBackend.expectDELETE(testData.knownUserUrl);
        expect(user.delete()).toBeSuccessErrorPromise();
        $httpBackend.flush();
      });

      it('noops on unknown users', function() {
        user._id = undefined;
        expect(user.delete()).toBeSuccessErrorPromise();
        // $httpBackend causes error if request was sent
      });

      it('transforms item request', function() {
        spyOn(user, 'transformItemRequest');
        user.delete();
        expect(user.transformItemRequest).toHaveBeenCalled();
        $httpBackend.flush();
      });
    });
  });

});
