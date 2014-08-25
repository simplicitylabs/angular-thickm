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
    module = angular.module('thickm.collection');
    dependencies = module.requires;
  });

  it('should load util module', function() {
    expect(hasModule('thickm.util')).toBeTruthy();
  });

});
