'use strict';

angular.module('github')
.factory('GithubModel', function(ThickModel, GithubModelCollection) {
    function GithubModel(data) {
        ThickModel.call(this, data);
    }
    ThickModel.extend(GithubModel);
    GithubModel._collectionClass = GithubModelCollection;
    GithubModel.prototype._baseUrl = 'https://api.github.com/';

    return GithubModel;
});
