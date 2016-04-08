var Metalsmith = require('metalsmith'),
  layouts = require('metalsmith-layouts'),
  inplace = require('metalsmith-in-place'),
  models = require('metalsmith-models'),
  branch = require('metalsmith-branch'),
  debug = require('metalsmith-debug');

Metalsmith(__dirname)
  .source('source')
  // don't run 2015 through our pipeline
  .use(branch('!2015/*')
    .use(debug())
    .use(models({
      directory: 'data'
    }))
    .use(inplace({
      engine: 'swig',
      pattern: '**/*.html'
    }))
    .use(layouts({
      engine: 'swig',
      pattern: '**/*.html',
      directory: 'layouts'
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

//  .use(serve({
//    port: 8080,
//    verbose: true
//  }))
//  .use(watch({
//    pattern: '**/*',
//    livereload: true
//  }))

