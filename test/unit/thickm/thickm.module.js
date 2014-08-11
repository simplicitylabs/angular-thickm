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
    module = angular.module('thickm');
    dependencies = module.requires;
  });

  it('should load resource module', function() {
    expect(hasModule('thickm.resource')).toBeTruthy();
  });

  it('should load collection module', function() {
    expect(hasModule('thickm.collection')).toBeTruthy();
  });
});
