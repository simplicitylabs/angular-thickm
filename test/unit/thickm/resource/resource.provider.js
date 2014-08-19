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
 * Direct tests
 */
describe('Resource', function() {
  beforeEach(module('thickm.resource'));

  var Resource, $http, $q;
  beforeEach(inject(function(_Resource_, _$http_, _$q_) {
    Resource = _Resource_;
    $http = _$http_;
    $q = _$q_;
  }));

  describe('constructor', function() {
    it('can run without arguments', function() {
      var r = new Resource();
      expect(r instanceof Resource).toEqual(true);
    });

    it('copies properties from passed object', function() {
      var r = new Resource({prop: 'val'});
      expect(r.prop).toEqual('val');
    });
  });

  describe('validate', function() {
    it('returns true when passed an object', function() {
      expect(Resource.validate({})).toEqual(true);
    });

    it('returns false when passed non-object', function() {
      expect(Resource.validate('')).toEqual(false);
    });
  });

  describe('build', function() {
    it('returns resource instance when passed object', function() {
      expect(Resource.build({}) instanceof Resource).toEqual(true);
    });

    it('throws when passed non-object', function() {
      expect(function() {
        return Resource.build('');
      }).toThrow();
    });
  });

  describe('transformCollectionResponse', function() {
    it('builds from response with collection class\' build',
        inject(function(ResourceCollection) {
      spyOn(ResourceCollection, 'build').andCallFake(function() {
        return new ResourceCollection();
      });
      var c = Resource.transformCollectionResponse({});
      expect(c instanceof ResourceCollection).toEqual(true);
      expect(ResourceCollection.build).toHaveBeenCalled();
    }));
  });

  describe('transformItemResponse', function() {
    it('builds from response with own build', function() {
      spyOn(Resource, 'build').andCallFake(function() {
        return new Resource();
      });
      var f = Resource.transformItemResponse({});
      expect(f instanceof Resource).toEqual(true);
      expect(Resource.build).toHaveBeenCalled();
    });
  });

  describe('queryUrl', function() {
    var fakeUrl = 'http://fake';

    beforeEach(function() {
      spyOn($http, 'get').andCallFake(function() {
        return $q.defer().promise;
      });
    });

    it('sends HTTP query to specified URL', function() {
      var p = Resource.queryUrl(fakeUrl);
      expect(p).toBeSuccessErrorPromise();
      expect($http.get).toHaveBeenCalledWith(fakeUrl, undefined);
    });

    it('sends HTTP parameters', function() {
      var p = Resource.queryUrl(fakeUrl, {a: 'b'});
      expect(p).toBeSuccessErrorPromise();
      expect($http.get).toHaveBeenCalledWith(fakeUrl, {params:{a: 'b'}});
    });
  });

  describe('query', function() {
    it('calls queryUrl with collectionUrl and parameters', function() {
      spyOn(Resource, 'queryUrl');
      Resource.query({a: 'b'});
      expect(Resource.queryUrl).toHaveBeenCalledWith('/items', {a: 'b'});
    });
  });

  describe('getUrl', function() {
    var fakeUrl = 'http://fake/item';

    beforeEach(function() {
      spyOn($http, 'get').andCallFake(function() {
        return $q.defer().promise;
      });
    });

    it('sends HTTP query to specified URL', function() {
      var p = Resource.getUrl(fakeUrl);
      expect(p).toBeSuccessErrorPromise();
      expect($http.get).toHaveBeenCalledWith(fakeUrl, undefined);
    });

    it('sends HTTP parameters', function() {
      var p = Resource.getUrl(fakeUrl, {a: 'b'});
      expect(p).toBeSuccessErrorPromise();
      expect($http.get).toHaveBeenCalledWith(fakeUrl, {params:{a: 'b'}});
    });
  });

  describe('get', function() {
    it('calls getUrl with itemUrl and parameters', function() {
      spyOn(Resource, 'getUrl');
      Resource.get(1, {a: 'b'});
      expect(Resource.getUrl).toHaveBeenCalledWith('/items/1', {a: 'b'});
    });
  });

  describe('extend', function() {
    var Cls, cls;
    beforeEach(function() {
      Cls = function Cls(){};
      Resource.extend(Cls);
      cls = new Cls();
    });

    it('extends prototype', function() {
      expect(angular.isFunction(cls.getCollectionUrl)).toEqual(true);
    });

    it('copies static functions functions', function() {
      expect(angular.isFunction(Cls.extend)).toEqual(true);
    });

    it('result is still instance of Resource', function() {
      expect(cls instanceof Resource).toEqual(true);
    });

    it('result is also instance of Cls', function() {
      expect(cls instanceof Cls).toEqual(true);
    });
  });

  describe('prototype', function() {
    var r;
    var ResourceCollection;
    beforeEach(inject(function(_ResourceCollection_) {
      r = new Resource();
      ResourceCollection = _ResourceCollection_;
    }));

    describe('values', function() {
      it('has _resourceName items', function() {
        expect(r._resourceName).toEqual('items');
      });

      it('has _primaryfield id', function() {
        expect(r._primaryField).toEqual('id');
      });

      // it('has ResourceCollection as _collectionClass',
      //     inject(function(ResourceCollection) {
      //   expect(r._collectionClass).toBe(ResourceCollection);
      // }));
    });

    describe('getCollectionUrl', function() {
      it('returns /._resourceName', function() {
        expect(r.getCollectionUrl()).toEqual('/items');
      });
    });

    describe('getResourceUrl', function() {
      it('returns /._resourceName/id for string', function() {
        expect(r.getResourceUrl('id')).toEqual('/items/id');
      });

      it('returns /._resourceName/id for int', function() {
        expect(r.getResourceUrl(1)).toEqual('/items/1');
      });
    });

    describe('transformItemRequest', function() {
      it('takes an argument', function() {
        expect(r.transformItemRequest.length).toEqual(1);
      });

      it('returns an object', function() {
        expect(angular.isObject(r.transformItemRequest())).toEqual(true);
      });
    });

    describe('isNew', function() {
      it('returns true when _primaryField is not defined', function() {
        expect(r.isNew()).toEqual(true);
      });

      it('returns false when _primaryField is defined', function() {
        r[r._primaryField] = 1;
        expect(r.isNew()).toEqual(false);
      });
    });

    describe('update', function() {
      it('overwrites object\'s data', function() {
        r.name = 'a';
        r.update({name: 'b'});
        expect(r.name).toEqual('b');
      });
    });

    describe('save', function() {
      beforeEach(function() {
        spyOn($http, 'post').andCallFake(function() {
          return $q.defer().promise;
        });
        spyOn($http, 'put').andCallFake(function() {
          var deferred = $q.defer();
          deferred.resolve({property: 'fromserver'});
          return deferred.promise;
        });
        spyOn(r, 'transformItemRequest').andCallFake(function(headers) {
          headers['Fake-Header'] = 'Value';
          return {a: 'b'};
        });
      });

      it('POSTs to collectionUrl if r is new', function() {
        expect(r.save()).toBeSuccessErrorPromise();
        expect($http.post.calls[0].args[0]).toEqual(r.getCollectionUrl());
      });

      it('PUTs to resourceUrl if r is not new', function() {
        r[r._primaryField] = 1;
        expect(r.save()).toBeSuccessErrorPromise();
        expect($http.put.calls[0].args[0]).toEqual(r.getResourceUrl());
      });

      it('calls gets data/headers via transformItemRequest', function() {
        r.save();

        expect(r.transformItemRequest).toHaveBeenCalled();
        expect($http.post.calls[0].args[1]).toEqual({a: 'b'});
        expect($http.post.calls[0].args[2].headers['Fake-Header']).toEqual('Value');
      });

      it('has application/json content type with POST', function() {
        r.save();

        expect($http.post.calls[0].args[2].headers['Content-Type']).toEqual('application/json');
      });

      it('has application/json content type with PUT', function() {
        r[r._primaryField] = 1;
        r.save();

        expect($http.put.calls[0].args[2].headers['Content-Type']).toEqual('application/json');
      });

      it('updates r\'s data with data from server', function() {
        r[r._primaryField] = 1;
        r.save().then(function() {
          expect(r.property).toEqual('fromserver');
        });
      });

      it('is still a Resource after save', function() {
        r[r._primaryField] = 1;
        r.save().then(function() {
          expect(r instanceof Resource).toEqual(true);
        });
      });
    });

    describe('delete', function() {
      beforeEach(function() {
        spyOn($http, 'delete').andCallFake(function() {
          return $q.defer().promise;
        });
      });

      it('does not DELETE if r is new', function() {
        expect(r.delete()).toBeSuccessErrorPromise();
        expect($http.delete).not.toHaveBeenCalled();
      });

      it('DELETEs if r isn\'t new', function() {
        r[r._primaryField] = 1;
        expect(r.delete()).toBeSuccessErrorPromise();
        expect($http.delete).toHaveBeenCalled();
      });

      it('DELETEs to resourceUrl', function() {
        r[r._primaryField] = 1;
        r.delete();
        expect($http.delete.calls[0].args[0]).toEqual(r.getResourceUrl());
      });

      it('has application/json content type', function() {
        r[r._primaryField] = 1;
        r.delete();
        expect($http.delete.calls[0].args[1].headers['Content-Type']).toEqual('application/json');
      });
    });
  });
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
