'use strict';

angular.module('myApp')
.factory('User', function UserFactory(GithubModel) {
    function User(data) {
        GithubModel.call(this, data);
    }
    GithubModel.extend(User);
    User.prototype._modelName = 'users';

    return User;
});
