/**
 * Une tache "webpack-light" à été ajoutée sans pipe compréssé ni minifié pour
 * alléger un peu la tâche de nos vilaines et lentes machines
 */

var gulp = require('gulp'),
    webpack = require("gulp-webpack"),
    named = require('vinyl-named'),
    eslint = require('gulp-eslint'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    uglify = require('gulp-uglify'),
    filter = require('gulp-filter'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    gzip = require('gulp-gzip'),
    through = require('through-gulp'),
    upath = require("upath");

var webpackEntries = ['js/secretary.js', 'js/start.js', "js/nurse.js"];
var filesToLint = ['js/**/*.js', 'serverCabinetMedical.js'];
var problemFiles = filesToLint.slice();

function appendProblemFiles(fName) {
    if (problemFiles.indexOf(fName) === -1) {
        problemFiles.push(fName);
    }
}

function removeProblemFiles(fName) {
    var pos = problemFiles.indexOf(fName)
    if (pos !== -1) {
        problemFiles.splice(problemFiles.indexOf(fName), 1);
    }
}

function listLinted() {
    return stream = through(function(file, encoding, callback) {
        this.push(file);
        if (file.eslint) {
            var fName = upath.normalizeSafe(file.cwd + '/' + file.eslint.filePath);
            var pos = problemFiles.indexOf(fName);
            if (file.eslint.errorCount || file.eslint.warningCount) {
                appendProblemFiles(fName);
            } else {
                removeProblemFiles(fName);
            }
        }
        callback();
    }, function(callback) {
        callback();
    });
}

function linterPipeline() {
    return gulp.src(problemFiles)
        .pipe(eslint())
        .pipe(listLinted())
        .pipe(eslint.format());
}

gulp.task('lint', function() {
    return linterPipeline();
});

gulp.task('watch', function() {
    problemFiles.splice(0, filesToLint.length);
    gulp.watch(filesToLint, function(event) {
        var fName = upath.normalizeSafe(event.path);
        if (event.type !== 'deleted') {
            appendProblemFiles(fName);
            return linterPipeline();
        }
    });
});

gulp.task("webpack", function(callback) {

    var wp =
        gulp.src(webpackEntries)
        .pipe(named())
        .pipe(webpack({
            progress: false,
            stats: {
                colors: true,
                modules: false,
                reasons: false
            },
            watch: true,
            module: {
                loaders: [{
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
                }, {
                    test: /\.html$/,
                    loader: 'raw-loader'
                }, {
                    test: /\.(png|woff|jpg|jpeg|gif)$/,
                    loader: 'url-loader?limit=100000'
                }]
            },
            plugins: [new ExtractTextPlugin("[name].css")],
            failOnError: false
        }));


    // Split CSS and JS process
    var css = wp.pipe(filter('*.css')),
        js = wp.pipe(filter('*.js'));

    // CSS process
    css.pipe(autoprefixer());

    // Split dev and dist
    css.pipe(gulp.dest('dev'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'))
        .pipe(gzip())
        .pipe(gulp.dest('dist'));


    // JS process
    js.pipe(gulp.dest('dev'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(gzip())
        .pipe(gulp.dest('dist'));
    return wp;
});

/*
 * ////////////////////////////////////////////////////////////////////////////////
 */

/**
 * Tache modifiée pour s'éxecuter plus rapidement. Pas de version de distribution, pas de zip.
 */
gulp.task("webpack-light", function() {

    log("\n");
    log("Attention: version modifiée du fichier gulp.js original destinée au développement (pas de lint, pas de version de distribution) ", true);
    log("\n");

    var wp =
        gulp.src(webpackEntries)
        .pipe(named())
        .pipe(webpack({
            progress: false,
            stats: {
                colors: true,
                modules: false,
                reasons: false
            },
            watch: true,
            module: {
                loaders: [{
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
                }, {
                    test: /\.html$/,
                    loader: 'raw-loader'
                }, {
                    test: /\.(png|woff|jpg|jpeg|gif)$/,
                    loader: 'url-loader?limit=100000'
                }]
            },
            plugins: [new ExtractTextPlugin("[name].css")],
            failOnError: false
        }));


    // Split CSS and JS process
    var css = wp.pipe(filter('*.css')),
        js = wp.pipe(filter('*.js'));

    // CSS process
    css.pipe(autoprefixer());


    // Split dev and dist
    css.pipe(gulp.dest('dev'));

    // JS process
    js.pipe(gulp.dest('dev'));

    return wp;
});

/**
 * Fonction de journalisation de texte. Si inColor = true alors le texte sera écrit en bleu.
 * @type Module safe|Module safe
 */
var colors = require('colors/safe');

function log(text, inColor) {

    if (inColor === undefined) {
        inColor = false;
    }
    if (inColor) {
        text = colors.green(text);
    }

    console.log(text);
}

//gulp.task('default', ['webpack', 'lint', 'watch'], function () {
gulp.task('default', ['webpack-light'], function() {
    console.log("Done.");
});
