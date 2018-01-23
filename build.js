"use strict";

const metalsmith = require('metalsmith');
const branch = require('metalsmith-branch');
const debug = require('metalsmith-debug');
const define = require('metalsmith-define');
const filenames = require('metalsmith-filenames');
const fingerprint = require('metalsmith-fingerprint-ignore');
const ignore = require('metalsmith-ignore');
const inplace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const permalinks = require('metalsmith-permalinks');
const serve = require('metalsmith-serve');
const stylus = require('metalsmith-stylus');
const uglify = require('metalsmith-uglify');
const watch = require('metalsmith-watch');

// This is a plugin.
// Lets 'node build' run lean, while 'node build dev' loads add'l plugins.
// TODO: make it a real plugin.
const devonly = function(plugin, options) {
    if (process.argv.length > 2 && process.argv.indexOf('dev') > 0) {
        return plugin(options);
    }
    else {
        return function(files, metalsmith, done) {
            done();
        };
    }
};

// This is a plugin.
// Dumps some variables to the screen.
// TODO: make it a real plugin.
const dump = function(options) {
    return function(files, metalsmith, done) {
        console.log(metalsmith);
        done();
    };
};


metalsmith(__dirname)
    // Input files from source directory.
    .source('source')
    // Define some global values that will be accessible in metadata anywhere.
    .use(define({
        date_format: 'j F, Y',
        version_date: new Date().toISOString(),
    }))
    // Add debug messages to terminal. Dev-only.
    .use(devonly(debug, {}))
    // Give each file processed a name during conversion, which is required for
    // template inheritance in swig. Conflicts with branch so run it out here.
    // https://github.com/MoOx/metalsmith-filenames/issues/1
    .use(filenames())
    // Restrict the files we transform to a pattern; don't transform 2015.
    .use(branch('!2015/**/*')
    .use(branch('!berlin-2016/**/*')
    .use(branch('!london-2017/**/*')
    .use(branch('!assets/**/*')
        // Ignore files that we don't want to copy to build dir.
        // Must follow json_to_files
        .use(ignore([
            '**/_*',
            '**/*swp',
            // At launch we may not have a seattle event. This prevents building its pages.
            // '**/seattle-2016/*',
        ]))
        // Make pretty urls by moving foo.html to /foo/index.html.
        // Also, add a 'path' to global metadata for each file.
        .use(permalinks({
            relative: false,
        }))
        // Minimize and concatenate js files. Must be above fingerprint.
        .use(uglify({
            filter: 'js/*.js',
            sourceMap: true,
            concat: 'js/main.js',
        }))
        // Convert stylus files to css. Must be above fingerprint.
        .use(stylus({
            compress: true
        }))
        // Change asset filenames to unique strings per build for cachebusting.
        // Must be above inplace.
        .use(fingerprint({
            pattern: ['stylesheets/style.css', 'js/*.js'],
        }))
        // Process template files in the source dir using specified engine.
        .use(inplace({
            engine: 'swig',
            pattern: ['**/*.html', 'worker.js'],
            autoescape: false,
        }))
        // Apply layouts to (certain) source files using specified engine.
        // We only use this to support json_to_files.
        .use(layouts({
            engine: 'swig',
            pattern: '**/*.html',
            autoescape: false,
        }))
        // Log global metadata, etc., to terminal.
        .use(devonly(dump))
    ))))
    // Output files to build dir.
    .destination('build')
    // Automatically rebuild things in the source directory when they change.
    .use(devonly(watch, {
        paths: {
            'source/assets/**/*': true,
            'source/js/**/*': true,
            'source/stylesheets/**/*': true,
            'source/*': true,
            'source/data/**/*': '**/*',
            'layouts/**/*': '**/*',
        },
        livereload: true,
    }))
    // Start a server on localhost.
    .use(devonly(serve, {
        host: '0.0.0.0',
        port: 8080,
        verbose: true,
        http_error_files: {
          404: "/404.html",
        },
    }))
    .use(devonly(define, {
        livereload: '<script src="http://localhost:35729/livereload.js"></script>',
    }))
    // Do it!
    .build(function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.info('✫ Built it. ✫');
        }
    });
