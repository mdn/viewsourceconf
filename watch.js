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
    .use(debug())
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
        }))
        .use(layouts({
            engine: 'swig',
            pattern: '**/*.html',
            directory: 'layouts',
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
    .use(watch({
        pattern: '**/*',
        livereload: true,
    }))
    .use(serve({
        host: '0.0.0.0',
        port: 8080,
        verbose: true,
    }))
    .build(function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.info('✫ Built it. ✫');
        }
    });
