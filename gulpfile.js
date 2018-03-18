'use strict'

// import
const gulp = require('gulp')
const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob')
const pleeease = require('gulp-pleeease')
const pug = require('gulp-pug')
const browserSync = require('browser-sync')
const readConfig = require('read-config')
const watch = require('gulp-watch')
const RevLogger = require('rev-logger')
const config = require('./config')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const postcssAsset = require('postcss-assets')

// const
const SRC = config.SRC
const CONFIG = config.CONFIG
const HTDOCS = config.HTDOCS
const BASE_PATH = config.BASE_PATH
const DEST = config.DEST

const revLogger = new RevLogger({
    'style.css': `${DEST}/css/style.css`,
    'script.js': `${DEST}/js/script.js`
})

// css
gulp.task('sass', () => {
    const config = readConfig(`${CONFIG}/pleeease.json`)
    const plugin = [
        require('postcss-assets')({
            loadPaths: [`${DEST}/img`],
            basePath: './',
            relative: `./${DEST}/css`
        }),
        require('autoprefixer')({
            browsers: ['ie >= 11', 'ios >= 9', 'android >= 4.4.4'],
            grid: true
        })
    ]
    return gulp
        .src(`${SRC}/scss/style.scss`)
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(postcss(plugin))
        .pipe(pleeease(config))
        .pipe(gulp.dest(`${DEST}/css`))
})

gulp.task('css', gulp.series('sass'))

// js
const webpackConfig = require('./webpack.config')
gulp.task('webpack', () => {
    return webpackStream(webpackConfig, webpack).pipe(gulp.dest(`${DEST}/js`))
})
gulp.task('js', gulp.parallel('webpack'))

// html
gulp.task('pug', () => {
    const locals = {
        meta: readConfig(`${CONFIG}/meta.yml`),
        versions: revLogger.versions(),
        basePath: BASE_PATH
    }

    return gulp
        .src(`${SRC}/pug/**/[!_]*.pug`)
        .pipe(
            pug({
                locals: locals,
                pretty: true,
                basedir: `${SRC}/pug`
            })
        )
        .pipe(gulp.dest(`${DEST}`))
})

gulp.task('html', gulp.series('pug'))

// serve
gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: HTDOCS
        },
        startPath: `${BASE_PATH}/`,
        ghostMode: false
    })

    watch([`${SRC}/scss/**/*.scss`], gulp.series('sass', browserSync.reload))
    watch([`${SRC}/js/**/*.js`], gulp.series('webpack', browserSync.reload))
    watch(
        [`${SRC}/pug/**/*.pug`, `${SRC}/config/meta.yml`],
        gulp.series('pug', browserSync.reload)
    )

    revLogger.watch((changed) => {
        gulp.series('pug', browserSync.reload)()
    })
})

gulp.task('serve', gulp.series('browser-sync'))

// default
gulp.task('build', gulp.parallel('css', 'js', 'html'))
gulp.task('default', gulp.series('build', 'serve'))
