'use strict';

angular.module('myApp')
.factory('Gist', function GistFactory(GithubModel) {
    function Gist(data) {
        GithubModel.call(this, data);
    }
    GithubModel.extend(Gist);
    Gist.prototype._modelName = 'gists';

    // Gists do not have names, so we construct them
    Gist.prototype.getName = function() {
        var filenames = Object.keys(this.files);
        return filenames[0];
    };

    // Number of files in a gist
    Gist.prototype.getNumFiles = function() {
      return Object.keys(this.files).length;
    };

    return Gist;
});
