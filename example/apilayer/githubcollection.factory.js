'use strict';

angular.module('github')
.factory('GithubModelCollection', function(ThickModelCollection) {
    function GithubModelCollection() {
        ThickModelCollection.call(this, arguments);
    }
    ThickModelCollection.extend(GithubModelCollection);

    // Parse links from response headers
    function parseGithubHeaderLinks(linkStr) {
        var links = linkStr.split(',');
        var obj = {};
        links.map(function(rawLink) {
            return {
                rel: /rel="(\w+)"/.exec(rawLink)[1],
                url: /<([^>]+)/.exec(rawLink)[1]
            };
        }).forEach(function(link) {
            obj[link.rel] = link.url;
        });
        return obj;
    }

    // Get the page number from a link
    function pageNumberFromLink(link) {
        return /page=(\d+)/.exec(link)[1];
    }

    // Get meta data from response headers
    // For Github, they're put on headers
    GithubModelCollection.metaFromResponse = function(cls, response) {
        var headers = response.headers();
        return {
            etag: headers.etag,
            links: parseGithubHeaderLinks(headers.link),
            rateLimit: {
                limit: parseInt(headers['x-ratelimit-limit']),
                remaining: parseInt(headers['x-ratelimit-remaining']),
                reset: parseInt(headers['x-ratelimit-reset'])
            }
        };
    };

    // Get the time when rate limit resets as a Date
    GithubModelCollection.prototype.rateResetDate = function() {
        return new Date(this._meta.rateLimit.reset * 1000);
    };

    // Has next link?
    GithubModelCollection.prototype.hasNext = function() {
        return angular.isDefined(this._meta.links.next);
    };

    // Has prev link?
    GithubModelCollection.prototype.hasPrev = function() {
        return angular.isDefined(this._meta.links.prev);
    };

    // Get page from link, returns promise of a new collection instance
    GithubModelCollection.prototype.getLink = function(link) {
        var params = {page: pageNumberFromLink(this._meta.links[link])};
        return this._modelClass.query(params);
    };

    // Get the next page, returns promise of a new collection instance
    GithubModelCollection.prototype.getNext = function(link) {
        return this.getLink('next');
    };

    // Get the last page, returns promise of a new collection instance
    GithubModelCollection.prototype.getLast = function() {
        return this.getLink('last');
    };

    // Get the first page, returns promise of a new collection instance
    GithubModelCollection.prototype.getFirst = function() {
        return this.getLink('first');
    };

    // Get the prev page, returns promise of a new collection instance
    GithubModelCollection.prototype.getPrev = function() {
        return this.getLink('prev');
    };

    return GithubModelCollection;
});
