'use strict';

angular.module('thickm.util')
.factory('ThickmUtil', function Util() {

  function extend(subclass, superclass) {
    var Tmp = function() {};
    Tmp.prototype = superclass.prototype;
    subclass.prototype = new Tmp();
    subclass.prototype.constructor = subclass;
  }

  return {
    extend: extend
  };
});
