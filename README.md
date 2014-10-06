ThickM
-------

[![Build Status](https://travis-ci.org/simplicitylabs/angular-thickm.svg?branch=develop)](https://travis-ci.org/simplicitylabs/angular-thickm)

## Example usage

Example code in `/example` folder: a simple GitHub Gist browser with a GitHub
API compatibility layer. [**Live example**](http://simplicitylabs.github.io/angular-thickm/example/).

## Introduction

ThickM is a simplistic library for AngularJS which takes a class based approach
to building model layers communicating with REST services. This is perfect for
building rich ("thick"), extendable models with domain logic in the form of
properties, methods and types.

ThickM is based on a belief that much of the logic for an application often is
best placed in the model, and that they often are stored at and retrieved from
a REST API service. It also wants implementation details for any such API to be
based on code rather than configuration, for easier testing and debugging and
for more flexibility.

This leads to simpler controllers, easier and fewer redundant tests and an
easier to maintain codebase.

ThickM doesn't try to be a drop-in solution for every API, because APIs,
applications, uses and technologies are different.

Wouldn't it be cool to have models like this?

```javascript
Flight.query({from: 'New York', to: 'London'}).then(function(flights) {
  console.log(flights.length); // outputs 8
  console.log(flights.getAvailableSeats()); // outputs 324

  // ...

  var fastestFlight = fligths.getFastest();
  console.log(fastestFlight instanceof Flight); // outputs true

  fastestFligth.book(2); // books two seats
});
```

## Overview

Think of ThickM as the bottom layer in a layer based model layer. Say layer one
more time for good measure. The layers are:

 - Your models
 - API specific compatibility layer
 - ThickM

Let's go though them from the top down:

### Your models

These are the application or domain specific models for your application. They
implement stuff like users, groups, cars, trees or any other entity you might
need. They typically consist of one class per model, implemented in JavaScript,
and can be as minimal as a couple of lines of code, or as big and complex as you
want.

```javascript
angular.module('myApp.model.plane')
.factory('Plane', function PlaneFactory(MyApiModel) {
  function Plane(data) {
    MyApiModel.call(this, data); // call parent constructor
  }

  MyApiModel.extend(Plane); // extend parent class
  Plane.prototype._modelName = 'planes'; // goes in the URLs

  // Possibly overwrite or add methods here ...

  return Plane;
});
```

If two or more of the models share logic, it may make sense to create a common
superclass which they both inherit from.

It may also make sense to create a specialized collection class for the model
or models, which inherits from the API compatibility layer's.

### API compatibility layer

The API compatibility layer specifies how your API works: how meta data is
described and organized, where items are located in a response, implementation
of support for technologies such as etags and so on.

It can also have its own logic and methods, which makes sense for the API or
usage in question, or specialized error handling.

Compatibility is created by overwriting properties or methods of the
`ThickModel` superclass.

A full implementation of an API compatibility layer with etags can be found
at [angular-evening](https://github.com/simplicitylabs/angular-evening), a
library implemented for APIs created with the Python library Eve.

```javascript
/* These classes implement a minimal API compatibility layer, which can be
 * specific to your app or a stand-alone library facilitating apps for the
 * kind of API you're using.
 *
 * This implementation only sets models' id field to '_id', and specifies that
 * items in query responses are located in '_items', while meta data is in
 * '_meta'.
 */

/**
 * MyApiModel
 */
angular.module('myApi.model')
.factory('MyApiModel', function MyApiModelFactory(ThickModel,
    MyApiModelCollection) {
  function MyApiModel(data) {
    this._primaryField = '_id';  // set 'id' field of models
    ThickModel.call(this, data); // call parent constructor
  }

  ThickModel.extend(MyApiModel); // extend parent class
  MyApiModel._collectionClass = MyApiModelCollection; // set collection class

  MyApiModel._modelName = 'mymodel'; // for URLs
  MyApiModel._baseUrl = '/api/v1/';  // for URLs, can also be set in API layer

  // Possibly overwrite or add methods here ...

  return MyApiModel;
});

/**
 * MyApiModelCollection
 */
angular.module('myApi.collection')
.factory('MyApiModelCollection',
    function MyApiModelCollection(ThickModelCollection) {

  function MyApiModelCollection() {
    ThickModelCollection.apply(this, arguments); // call parent constructor
  }
  ThickModelCollection.extend(MyApiModelCollection); // extend parent class

  MyApiModelCollection._itemsField = '_items'; // set where the array of items
                                               // (which will be converted to
                                               // model instances) are
  MyApiModelCollection._metaField = '_meta'; // set where resource meta data
                                             // such as total available items
                                             // and pagination is located

  // Possibly overwrite or add methods here ...

  return MyApiModelCollection;
});
```

### ThickM

The ThickM layer is at the bottom, consisting of the classes `ThickModel` and
`ThickModelCollection`, superclasses for models and model collections,
respectively. They are responsible for communication using `$http`, with methods
like `get()`, `query()`, `save()` and `delete()`.

## Adding to my project

 - Using bower: `bower install angular-thickm --save`.
 - Manually using either raw or minified versions in the `dist` folder.

## Dependencies

There are no dependencies to this project other than AngularJS >= 1.2 (not
tested for earlier verions).

## Quick start guide

### Configuration

Add `thickm` to your application dependencies:
```javascript
angular.module('myApp', ['thickm']);
```

Create an API compatibility layer, as shown in the API compatibility section
above, subclassing ThickM's classes.

```javascript
angular.module('myApp')
.factory('MyApiModel', function MyApiModelFactory(ThickModel,
    MyApiModelCollection) {
  function MyApiModel(data) {
    // ...
  }

  MyApiModel._collectionClass = MyApiModelCollection;
  // ...

  return MyApiModel;
});

angular.module('myApp')
.factory('MyApiModelCollection',
    function MyApiModelCollection(ThickModelCollection) {

  function MyApiModelCollection() {
    // ...
  }

  // ...

  return MyApiModelCollection;
});
```

Then implement your models as shown in the "Your models" section above,
subclassing your API compatibility section.

### Usage

(Given a model named `Plane`)

Fetch a collection of items:
```javascript
Plane.query().then( ... ); // no parameters
Plane.query({make: 'airbus'}).then( ... ); // with parameters
```

Fetch one item by primary field:
```javascript
Plane.get(89); // fetches plane with id 89
```

Create a new item and save it
```javascript
var plane = new Plane({make: 'airbus', seats: 380});
plane.save();
```

Edit and save an item:
```javascript
Plane.get(89).success(function(plane) {
  plane.seats = 240;
  plane.save();
});
```

Delete an item:
```javascript
  // ...
  plane.delete()
```

## Reference

These are the full list of methods and properties for the classes. Not all need
to be used or overwritten.

### ThickModelCollection

Subclasses `Array` and behaves like one: can be indexed or iterated over, and
has properties like `length`.

 - `ThickModelCollection._itemsField` <br>Decides what field in the response
 holds the array of items. Default is `null`, indicating that the response is
 in itself an array.
 - `ThickModelCollection._metaField` <br>Decides what field in the response
 holds meta data, like the total number of items available and pagination.
 - `ThickModelCollection.itemsFromResponse(cls, response)` <br>Given a model
 class (subclass of `ThickModel`) and a response from `$http`, create an array
 of instances of the model class.
 - `ThickModelCollection.metaFromResponse(cls, response)` <br>Given a model
 class and a response from `$http`, create a meta data object with information
 about the total number of items available and pagination.
 - `ThickModelCollection.build(cls, response)` <br>Given a model class and
 a response from `$http`, create an instance of the `ThickModelCollection` class
 (or a subclass).
 - `ThickModelCollection.extend(cls)` <br>Extend a subclass, e.g.
 ```MyApiModelCollection.extend(ThickModelCollection);```
 - `ThickModelCollection.toArray()` <br>Return an array which passes Angular's
 `angular.isArray()`.

### ThickModel

 - `ThickModel(data)`<br>Copies all properties of `data` to the new instance
 (constructor).
 - `ThickModel.prototype._modelName` <br>Holds the model name for the class,
 for building URLs, e.g. `planes`.
 - `ThickModel.prototype._baseUrl` <br>Holds the base URL for this model, e.g.
 `http://myapp.com/api/v1/`.
 - `ThickModel.prototype._primaryField` <br>The name of the field of models to
 look them up by when building URLs, e.g. `id`.
 - `ThickModel._collectionClass` <br>The class to use for collections of this
 model, default is `ThickModelCollection`. Use a reference to the class, not
 its name.
 - `ThickModel.build(data)` <br>Factory method. Uses `data` object to create a
 instance of the model. Returns an instance of `ThickModel`.
 - `ThickModel.prototype.getCollectionUrl()` <br>Returns the collection URL as
 a string, based on the base URL set in `_baseUrl` and the `_modelName`.
 - `ThickModel.prototype.getModelUrl()` <br>Returns the model URL, i.e. the
 URL used to fetch that instance, based on `getCollectionUrl()` and
 `_primaryField`.
 - `ThickModel.transformCollectionResponse(response)` <br>Transform a collection
 response into a model collection (`ThickModelCollection` or the collection
 model given by `_collectionClass`) instance. Returns an instance.
 - `ThickModel.transformItemResponse(response)` <br>Transform an item response
 into a model instance. Returns an instance.
 - `ThickModel.prototype.transformItemRequest(headers)` <br>Transform a request
 sent to the API, possibly by altering the `headers` object. Returns an object
 representing the instance, the default is `this`.
 - `ThickModel.queryUrl(url[, params])` <br>Query the specific URL for a
  collection of items, using `params` as additional parameters in the URL (see
 `$http` documentation). Returns a promise resolving to an instance of the
 collection class.
 - `ThickModel.query([params])` <br>Query to the URL given by
 `getCollectionUrl()` for a collection of items. Returns promise resolving to an
 instance of the collection class.
 - `ThickModel.getUrl(url[, params])` <br>Get an item from the specific URL,
 using `params` as additional parameters in the URL (see `$http` documentation).
 Returns a promise resolving to an instance of `ThickModel`.
 - `ThickModel.get(id[, params])` <br>Get an item with the specific `id`
 (primary field), using `params` as additional parameters in the URL. Returns
 a promise resolving to an instance of `ThickModel`.
 - `ThickModel.prototype.isNew()` <br>Returns a boolean describing if the
 instance is fetched from the API or not. Default decides this based on whether
 its `id` (primary field) is set.
 - `ThickModel.prototype.update(data)` <br>Overwrite the instance's data with
 new data form the `data` object.
 - `ThickModel.prototype.save()` <br>Either POSTs or PUTs the instance to the
 URL given by `getCollectionUrl()` or `getModelUrl`, respectively, based on
 whether the object is "new" or not, given by `isNew()`. Returns a promise
 resolving to an instance of the model based on data given from the API, and
 also updates the instance from which is was called with this data.
 - `ThickModel.prototype.delete()` <br>DELETEs the model by a request to the
 URL given by `getModelUrl()` if the object is not new, or no-ops if it is.
 Either way, it returns a promise resolving to an empty object.
 - `ThickModel.extend(cls)` <br>Extend a subclass, e.g.
 ```MyApiModel.extend(ThickModel);```

## Example code

See also the `/example` folder.

Overwriting or creating new methods:
```javascript
// Extending a class method
// Pull in the '_links' field
MyModelCollection.build = function(cls, response) {
  // call the parent method
  var rc = ThickModelCollection.build.call(this, cls, response);
  // extend the returned value
  rc._links = response.data._links;
  return rc;
};

// Creating a new instance method
// See if there is more on the server
MyModelCollection.prototype.hasMore = function() {
  return angular.isDefined(this._links && this._links.next);
};
```


## Open source finished API compatibility layers

 - [angular-evening](https://github.com/simplicitylabs/angular-evening) for the
 Python REST framework *Eve*

## Contributing

Install
```
npm install && bower install
```

Build
```
grunt
```

Test
```
npm test
```

## License

[MIT](http://opensource.org/licenses/MIT) © [Silicon Laboratories,
Inc.](http://www.silabs.com)
