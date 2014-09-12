'use strict';

angular.module('myApp')
.controller('GistsCtrl', function(gists) {
    this.gists = gists;
    var ctrl = this;

    function copyGists(gists) {
        ctrl.gists = gists;
    }

    this.goToFirst = function() {
        ctrl.gists.getFirst().success(copyGists);
    };

    this.goToPrev = function() {
        ctrl.gists.getPrev().success(copyGists);
    };

    this.goToNext = function() {
        ctrl.gists.getNext().success(copyGists);
    };

    this.goToLast = function() {
        ctrl.gists.getLast().success(copyGists);
    };

});
