"use strict";

const metalsmith = require('metalsmith');
const fingerprint = require('metalsmith-fingerprint-ignore');
const filenames = require('metalsmith-filenames');
const inplace = require('metalsmith-in-place');
const models = require('metalsmith-models');
const permalinks = require('metalsmith-permalinks');
const stylus = require('metalsmith-stylus');
const uglify = require('metalsmith-uglify');
const branch = require('metalsmith-branch');
const ignore = require('metalsmith-ignore');
const debug = require('metalsmith-debug');
const serve = require('metalsmith-serve');
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
    }
};

metalsmith(__dirname)
    // Input files from source directory.
    .source('source')
    // Add debug messages to terminal.
    .use(devonly(debug, {}))
    // Ignore files in source directory that we don't want to copy to build dir.
    .use(ignore([
        '*swp',
    ]))
    // Give each file processed a name during conversion, which is required for
    // template inheritance in swig. Conflicts with branch so run it out here.
    // https://github.com/MoOx/metalsmith-filenames/issues/1
    .use(filenames())
    // Restrict the files we transform to a pattern; don't transform 2015.
    .use(branch('!2015/**/*')
        // Make pretty urls by moving foo.html to /foo/index.html.
        // Also, add a 'path' to global metadata for each file.
        .use(permalinks({
            relative: false,
        }))
        // Put json from /data into global metadata. Must be above inplace.
        .use(models({
            directory: 'data',
        }))
        // Minimize and concatenate js files. Must be above fingerprint.
        .use(uglify({
            pattern: 'js/*',
            sourceMap: true,
            concat: 'js/main.js',
        }))
        // Convert stylus files to css. Must be above fingerprint.
        .use(stylus({}))
        // Change asset filenames to unique strings per build for cachebusting.
        // Must be above inplace.
        .use(fingerprint({
            pattern: ['stylesheets/style.css', 'js/main.js'],
        }))
        // Process template files in the source dir using specified engine.
        .use(inplace({
            engine: 'swig',
            pattern: '**/*.html',
            autoescape: false,
        }))
        // Log global metadata, etc., to terminal.
        .use(devonly(dump))
    )
    // Output files to build dir.
    .destination('build')
    // Automatically rebuild things in the source directory when they change.
    .use(devonly(watch, {
        pattern: '**/*',
        livereload: true,
    }))
    // Start a server on localhost.
    .use(devonly(serve, {
        host: '0.0.0.0',
        port: 8080,
        verbose: true,
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
