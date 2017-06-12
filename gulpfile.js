const gulp = require('gulp');
const webserver = require('gulp-webserver');
const concat = require('gulp-concat');
const path = require('path');
const del = require('del');

const destDir = 'dist';
const src = {
  js: [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/graphlib/dist/graphlib.min.js',
    './node_modules/vis/dist/vis-network.min.js',
    './assets/js/app.js',
  ],
  css: [
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/vis/dist/vis-network.min.css',
  ],
  font: [
    './node_modules/bootstrap/fonts/*',
  ]
};

gulp.task('scripts', () => {
  return gulp.src(src.js)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(path.join(destDir, 'js')));
});

gulp.task('styles', () => {
  return gulp.src(src.css)
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(path.join(destDir, 'css')));
});

gulp.task('fonts', () => {
  return gulp.src(src.font)
    .pipe(gulp.dest(path.join(destDir, 'fonts')));
});

gulp.task('clean', () => {
  return del(destDir);
});

gulp.task('default', ['scripts', 'styles', 'fonts']);

gulp.task('webserver', () => {
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
    }));
});
