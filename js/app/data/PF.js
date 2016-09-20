/**
 * Created by Bonsai on 16-8-26.
 */
define(['when', 'jquery'], function(when, $){
    "use strict";

    var PromiseFactory = function(){};

    PromiseFactory.prototype.createShapePointPromise = function(x, y){
        var defered = when.defer();
        var url = 'http://192.168.10.13:8989/draw/CHN/X/Y'.replace('X', x).replace('Y', y);
        url = 'js/app/data/oneTile.json';
        $.getJSON(url, function(data){
            defered.resolve(data.link_shape_points);
        });
        return defered.promise
    };

    PromiseFactory.prototype.createBuildPromise = function(x, y){
        var defered = when.defer();
        var url = 'js/app/data/build.json';
        $.getJSON(url, function(data){
            defered.resolve(data);
        });
        return defered.promise
    };


    return new PromiseFactory()
});
