'use strict';

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
