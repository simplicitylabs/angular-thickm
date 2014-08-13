'use strict';

describe('', function() {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {

    // Get module
    module = angular.module('thickm.resource');
    dependencies = module.requires;
  });

  it('should load collection module', function() {
    expect(hasModule('thickm.collection')).toBeTruthy();
  });

  it('should load util module', function() {
    expect(hasModule('thickm.util')).toBeTruthy();
  });

});
