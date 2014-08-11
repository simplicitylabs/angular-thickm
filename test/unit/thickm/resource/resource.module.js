'use strict';

describe('', function() {

  var module;
  var dependencies;
  dependencies = [];

  beforeEach(function() {

    // Get module
    module = angular.module('thickm.resource');
    dependencies = module.requires;
  });

  it('should have no dependencies', function() {
    expect(dependencies.length).toEqual(0);
  });

});
