/**
 * Created by ALI on 6/20/2017.
 */
'use strict';
var gulp = require('gulp');
var svgstore = require('gulp-svgstore');
var sprite = require('gulp.spritesmith');
var svgmin = require('gulp-svgmin');
var rename = require('gulp-rename');
var lesscss = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var mqpacker = require('css-mqpacker');
var minify = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var del = require('del');
var run = require('run-sequence');
var gh_pages = require('gulp-gh-pages');
var useref = require("gulp-useref");
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var path = require('path');
var concat = require('gulp-concat');
var argv = require('minimist')(process.argv.slice(2));
var cache = require('gulp-cache');
var combine = require('stream-combiner2');
var babel = require('gulp-babel');
var filter = require('gulp-filter');
var cheerio = require('gulp-cheerio');
var merge = require('merge-stream');

var isProduction = !!argv.production;
var buildPath = isProduction ? 'build' : 'app';
var srcPath = 'app/';


gulp.task('less', function () {
    return gulp.src("less/style.less", {cwd: srcPath})
        .pipe(plumber())
        .pipe(lesscss())
        .pipe(gulp.dest("app/css"))
});


gulp.task('js', function () {
    return gulp.src('js/dev/*.js', {cwd: srcPath})
        .pipe(plumber())
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest(srcPath + '/js'))
});

{
    gulp.task('html', function () {
        return gulp.src('**/*.html', {cwd: srcPath})
            .pipe(gulpIf(isProduction, useref()))
            .pipe(gulpIf(isProduction, combine(gulpIf('*.css', minify()))))
            .pipe(gulpIf(isProduction, combine(gulpIf('*.js', babel({presets: ['es2015']})))))
            .pipe(gulpIf(isProduction, combine(gulpIf('*.js', uglify()))))
            .pipe(gulpIf(isProduction, gulp.dest(buildPath)));

    })
}
gulp.task('symbols', function () {
    return gulp.src('**/*.svg', {cwd: path.join(srcPath, 'img/icons-svg')})
        .pipe(svgmin())
        /*   .pipe(cheerio({
         run: function ($) {
         $('[fill]').removeAttr('fill');
         },
         parserOptions: {xmlMode: true}
         }))*/
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename('symbols.svg'))
        .pipe(gulp.dest(buildPath + '/img'));
});


gulp.task('sprite', function () {
    var spriteData = gulp.src('app/img/sprite/*.png').pipe(sprite({
        imgName: 'sprite.png',
        cssName: 'sprite.less',
        imgPath: '../img/sprite.png'
    }));
    var imgStream = spriteData.img
        .pipe(gulp.dest(buildPath + '/img'));
    var lessStream = spriteData.css
        .pipe(gulp.dest('app/less'));
    return merge(imgStream, lessStream);
});


gulp.task('fonts', function () {
    return gulp.src('**/*', {cwd: path.join(srcPath + 'fonts')})
        .pipe(gulp.dest(buildPath + '/fonts'))
});

gulp.task("images", function () {
    return gulp.src(['img/**/*.{png,jpg,gif,svg}', '!icons-svg/**', '!sprite/**'], {cwd: srcPath})
        .pipe(gulpIf(isProduction, cache(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))))
        .pipe(gulp.dest(buildPath + '/img'));
});

gulp.task('clean', function () {
    return del('build')
});


gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: buildPath
        },
        notify: false,
        ui: false
    });

    if (!isProduction) {
        gulp.watch("**/*.less", {cwd: path.join(srcPath, 'less')}, ['less', browserSync.reload]);
        gulp.watch('app/**/*.html', ['html', browserSync.reload]);
        gulp.watch('**/*.js', {cwd: path.join(srcPath, 'js')}, ['js', browserSync.reload]);
        gulp.watch('**/*.*', {cwd: path.join(srcPath, 'fonts')}, ['fonts', browserSync.reload]);
        gulp.watch(['**/*.*', '!icons-svg/**', '!sprite/**'], {cwd: path.join(srcPath, 'img')}, ['images', browserSync.reload]);
        gulp.watch('**/*.svg', {cwd: path.join(srcPath, 'img/icons-svg')}, ['symbols', browserSync.reload]);
        gulp.watch('**/*.png', {cwd: path.join(srcPath, 'img/sprite')}, ['sprite', browserSync.reload]);
    }
});

gulp.task('build', function (fn) {
    console.log(isProduction)
    if (isProduction) {
        run('clean', 'symbols','sprite', 'images', 'fonts', 'less', 'js', 'html', 'serve', fn)
    }
    else {
        run('symbols', 'sprite', 'js', 'images', 'less', 'serve', fn);
    }
});

gulp.task('default', ['build'])

gulp.task('deploy', function () {
    return gulp.src('**/*', {cwd: 'build'})
        .pipe(gh_pages())
});















