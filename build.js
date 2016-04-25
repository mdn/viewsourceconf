const metalsmith = require('metalsmith');
const layouts = require('metalsmith-layouts');
const inplace = require('metalsmith-in-place');
const models = require('metalsmith-models');
const stylus = require('metalsmith-stylus');
const uglify = require('metalsmith-uglify');
const branch = require('metalsmith-branch');
const ignore = require('metalsmith-ignore');
const debug = require('metalsmith-debug');
const serve = require('metalsmith-serve');
const watch = require('metalsmith-watch');

metalsmith(__dirname)
    .source('source')
    .use(ignore([
        '*swp',
    ]))
    // don't run 2015 through our conversions
    .use(branch('!2015/*')
        .use(models({
            directory: 'data',
        }))
        .use(inplace({
            engine: 'swig',
            pattern: '**/*.html',
            autoescape: false,
        }))
        .use(layouts({
            engine: 'swig',
            pattern: '**/*.html',
            directory: 'layouts',
            autoescape: false,
        }))
        .use(stylus({}))
        .use(uglify({
            pattern: 'js/*',
            sourceMap: true,
            concat: 'js/main.js',
        }))
        .use(function(files, metalsmith, done) {
            console.log(metalsmith);
            console.log(models);
            done();
        })
    )
    .destination('build')
    .build(function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.info('✫ Built it. ✫');
        }
    });
