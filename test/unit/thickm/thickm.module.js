'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('', function() {

    var module;
    var dependencies;
    dependencies = [];

    beforeEach(function() {

        // Get module
        module = angular.module('thickm');
        dependencies = module.requires;
    });

    it('should have no dependencies', function() {
        expect(dependencies.length).toEqual(0);
    });

});
