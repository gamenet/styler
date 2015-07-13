var NwBuilder = require('node-webkit-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('nw', function () {
    var nw = new NwBuilder({
        buildDir: '.bin/',
        files: './nwapp/**',
        platforms: ['win32']
    });

    nw.on('log', function (msg) {
        gutil.log('node-webkit-builder', msg);
    });

    return nw.build().catch(function (err) {
        gutil.log('node-webkit-builder', err);
    });
});

gulp.task('default', ['nw']);