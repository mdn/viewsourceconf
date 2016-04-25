const metalsmith = require('metalsmith');
const filenames = require('metalsmith-filenames')
const inplace = require('metalsmith-in-place');
const models = require('metalsmith-models');
const permalinks = require('metalsmith-permalinks');
const stylus = require('metalsmith-stylus');
const uglify = require('metalsmith-uglify');
const branch = require('metalsmith-branch');
const ignore = require('metalsmith-ignore');

metalsmith(__dirname)
    .source('source')
    .use(ignore([
        '*swp',
    ]))
    .use(filenames())
    // don't run 2015 through our conversions
    .use(branch('!2015/*')
        .use(permalinks({
          relative: false,
        }))
        .use(models({
            directory: 'data',
        }))
        .use(inplace({
            engine: 'swig',
            pattern: '**/*.html',
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
