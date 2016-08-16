"use strict";

const metalsmith = require('metalsmith');
const branch = require('metalsmith-branch');
const data_markdown = require('metalsmith-data-markdown');
const debug = require('metalsmith-debug');
const define = require('metalsmith-define');
const filenames = require('metalsmith-filenames');
const fingerprint = require('metalsmith-fingerprint-ignore');
const ignore = require('metalsmith-ignore');
const inplace = require('metalsmith-in-place');
const json_to_files = require('metalsmith-json-to-files');
const layouts = require('metalsmith-layouts');
const metadata = require('metalsmith-metadata');
const models = require('metalsmith-models');
const permalinks = require('metalsmith-permalinks');
const serve = require('metalsmith-serve');
const stylus = require('metalsmith-stylus');
const tidy = require('metalsmith-html-tidy');
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
    }))
    // Add debug messages to terminal. Dev-only.
    .use(devonly(debug, {}))
    // Give each file processed a name during conversion, which is required for
    // template inheritance in swig. Conflicts with branch so run it out here.
    // https://github.com/MoOx/metalsmith-filenames/issues/1
    .use(filenames())
    // Restrict the files we transform to a pattern; don't transform 2015.
    .use(branch('!2015/**/*')
    .use(branch('!assets/**/*')
        // Also put stuff from source/data into collections.
        .use(json_to_files({
            source_path: 'source/data/',
        }))
        // Ignore files that we don't want to copy to build dir.
        // Must follow json_to_files
        .use(ignore([
            '**/_*',
            '**/*swp',
            // At launch we may not have a seattle event. This prevents building its pages.
            // '**/seattle-2016/*',
        ]))
        // Put yaml from source/data into global metadata. Must be above inplace.
        .use(metadata({
            conferences: 'data/conferences.yaml',
            navigation: 'data/navigation.yaml',
            berlin_schedule: 'data/berlin_schedule.yaml',
            berlin_sessions: 'data/berlin_sessions.yaml',
            berlin_speakers: 'data/berlin_speakers.yaml',
            berlin_sponsors: 'data/berlin_sponsors.yaml',
            berlin_venue: 'data/berlin_venue.yaml',
        }))
        // Make pretty urls by moving foo.html to /foo/index.html.
        // Also, add a 'path' to global metadata for each file.
        .use(permalinks({
            relative: false,
        }))
        // Minimize and concatenate js files. Must be above fingerprint.
        .use(uglify({
            pattern: 'js/*.js',
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
            pattern: '**/*.html',
            autoescape: false,
        }))
        // Apply layouts to (certain) source files using specified engine.
        // We only use this to support json_to_files.
        .use(layouts({
            engine: 'swig',
            pattern: '**/*.html',
            autoescape: false,
        }))
        // Convert GFM content inside tags with "data-markdown" attribute.
        // Should be after all swig stuff.
        .use(data_markdown({
            marked: {
                gfm: true,
                breaks: true,
                tables: false,
                smartlists: true,
                smartypants: true,
            },
            removeAttributeAfterwards: true,
        }))
        // Tidy HTML
        .use(tidy({
            tidyOptions: {
                'indent-spaces': 4,
                'quote-ampersand': false,
                'coerce-endtags': false,
                'new-blocklevel-tags': ['svg', 'defs', 'path', 'polyline', 'line', 'polygon',],
            },
        }))
        // Log global metadata, etc., to terminal.
        .use(devonly(dump))
    ))
    // Output files to build dir.
    .destination('build')
    // Automatically rebuild things in the source directory when they change.
    .use(devonly(watch, {
        paths: {
            'source/assets/**/*': true,
            'source/*2016/**/*': true,
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
