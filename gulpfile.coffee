gulp = require('gulp')
sourcemaps = require('gulp-sourcemaps')
plumber = require('gulp-plumber')

stylus = require('gulp-stylus')
axis = require('axis')

gulp.task 'stylus', () ->
	gulp.src './css/app.styl'
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe stylus({use: axis(), compress: true})
		.pipe sourcemaps.write()
		.pipe gulp.dest('./css/')

gulp.task 'watch', () ->
	gulp.watch('./css/**/*.styl', ['stylus'])

gulp.task 'default', ['stylus', 'watch']
