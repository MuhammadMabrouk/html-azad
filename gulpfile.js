// series() to execute tasks in order
// parallel() to run them at concurrency
// watch() to watches changes to files and executes the task when a change occurs
const { parallel, watch } = require('gulp');

// src() and dest() are methods to interact with files
const { src, dest } = require('gulp');

// gulp plugins
const changed       = require("gulp-changed"); // for applying tasks only to files that have changed
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const image         = require('gulp-image');
const concat        = require("gulp-concat");
const cleanCSS      = require("gulp-clean-css");
const uglify        = require("gulp-uglify");
const mergeStream   = require("merge-stream");
const notify        = require('gulp-notify');
const zip           = require('gulp-zip');

// Gulp plugin to run a webserver (with LiveReload)
const connect       = require('gulp-connect');
    
// src & dest paths
const paths = {
  htmlSrc:              'src/pages/**/*.html',
  scssSrc:              'src/styles/**/*.scss',
  fontAwesomeSrc:       'src/styles/font-awesome.scss',
  bootstrapSrc:         'src/styles/bootstrap.scss',
  cssSrc:               'src/styles/**/*.css',
  stylesSrc:            'src/styles/**/*.*',
  imagesSrc:            'src/assets/images/**/*.*',
  faviconSrc:           'src/assets/favicon.*',
  fontsSrc:             'src/assets/fonts/**/*.*',
  fontAwesomeFontsSrc:  'node_modules/font-awesome/fonts/*',
  phpSrc:               'src/*.php',
  mainJsSrc:            'src/scripts/main.js',
  scriptsSrc:           'src/scripts/**/*.js',

  htmlDest:             'dist',
  stylesDest:           'dist/styles',
  imagesDest:           'dist/assets/images',
  faviconDest:          'dist/assets',
  fontsDest:            'dist/assets/fonts',
  phpDest:              'dist',
  scriptsDest:          'dist/scripts',
  
  nodeModules: {
    styles: [
      'node_modules/normalize.css/normalize.css',
      'node_modules/animate.css/animate.min.css',
      'node_modules/owl.carousel2/dist/assets/owl.carousel.min.css',
      'node_modules/owl.carousel2/dist/assets/owl.theme.default.min.css',
      'node_modules/ion-rangeslider/css/ion.rangeSlider.min.css'
    ],
    scripts: [
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      'node_modules/owl.carousel2/dist/owl.carousel.min.js',
      'node_modules/ion-rangeslider/js/ion.rangeSlider.min.js',
      'node_modules/jquery-circle-progress/dist/circle-progress.min.js',
      'node_modules/theia-sticky-sidebar/dist/ResizeSensor.min.js',
      'node_modules/theia-sticky-sidebar/dist/theia-sticky-sidebar.min.js'
    ]
  }
};

// html task
const html = () => {
  return src(paths.htmlSrc)
    .pipe(changed(paths.htmlDest))
    .pipe(dest(paths.htmlDest))
    .pipe(connect.reload())
    .pipe(notify('HTML task is done!'));
};

// main style file task (sass)
const mainStyleFile = () => {
  return src([paths.scssSrc, '!'+paths.fontAwesomeSrc, '!'+paths.bootstrapSrc])
    .pipe(changed(paths.stylesDest))
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(dest(paths.stylesDest))
    .pipe(connect.reload())
    .pipe(notify('Styles task is done!'));
};

// css libraries task
const cssLibraries = () => {

  // font-awesome task
  const fontAwesomeFile = src(paths.fontAwesomeSrc)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError));

  // bootstrap task
  const bootstrapFile = src(paths.bootstrapSrc)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError));

  // copy css files from styles folder
  const cssFiles = src([...paths.nodeModules.styles, paths.cssSrc]);

  return mergeStream(fontAwesomeFile, bootstrapFile, cssFiles)
    .pipe(concat('libraries.min.css'))
    .pipe(cleanCSS({compatibility: 'ie10'}))
    .pipe(dest(paths.stylesDest))
    .pipe(connect.reload())
    .pipe(notify('CSS files copied successfully!'));
};

// images task
const images = () => {
  return src(paths.imagesSrc)
    .pipe(changed(paths.imagesDest))
    .pipe(image())
    .pipe(dest(paths.imagesDest))
    .pipe(connect.reload())
    .pipe(notify('Images task is done!'));
};

// favicon task
const favicon = () => {
  return src(paths.faviconSrc, { allowEmpty: true })
    .pipe(image())
    .pipe(dest(paths.faviconDest))
    .pipe(connect.reload())
    .pipe(notify('Favicon copied successfully!'));
};

// fonts task
const fonts = () => {

  // main fonts task
  const fontsFiles = src(paths.fontsSrc)
    .pipe(changed(paths.fontsDest))
    .pipe(dest(paths.fontsDest))
    .pipe(connect.reload())
    .pipe(notify('Fonts files copied successfully!'));

  // font-awesome fonts task
  const FontAwesomeFontsFiles = src(paths.fontAwesomeFontsSrc)
    .pipe(changed(paths.fontsDest))
    .pipe(dest(paths.fontsDest))
    .pipe(connect.reload())
    .pipe(notify('FontAwesome fonts copied successfully!'));

  return mergeStream(fontsFiles, FontAwesomeFontsFiles);
};

// php task
const php = () => {

  // main php task
  return src(paths.phpSrc)
    .pipe(changed(paths.phpDest))
    .pipe(dest(paths.phpDest))
    .pipe(connect.reload())
    .pipe(notify('Php files copied successfully!'));
};

// main script file task
const mainScriptFile = () => {
  return src(paths.mainJsSrc)
    .pipe(changed(paths.scriptsDest))
    .pipe(dest(paths.scriptsDest))
    .pipe(connect.reload())
    .pipe(notify('Main script file task is done!'));
};

// js plugins task
const jsPlugins = () => {
  return src([...paths.nodeModules.scripts, paths.scriptsSrc, '!'+paths.mainJsSrc])
    .pipe(changed(paths.scriptsDest))
    .pipe(concat('plugins.min.js'))
    .pipe(uglify())
    .pipe(dest(paths.scriptsDest))
    .pipe(connect.reload())
    .pipe(notify('Js plugins copied successfully!'));
};

// zipper task
const zipper = () => {
  return src('dist/**/*.*')
    .pipe(zip('template.zip'))
    .pipe(dest('dist'))
    .pipe(notify('Files have been compressed!'));
};

// watcher task
const watcher = (cb) => {

  connect.server({
    root: './dist/',
    livereload: true
  });

  // html task
  watch(paths.htmlSrc, html);

  // main style file task
  watch([paths.scssSrc, '!'+paths.fontAwesomeSrc, '!'+paths.bootstrapSrc], mainStyleFile);

  // css libraries task
  watch([...paths.nodeModules.styles, paths.cssSrc, paths.fontAwesomeSrc, paths.bootstrapSrc], cssLibraries);

  // images task
  watch(paths.imagesSrc, images);

  // favicon task
  watch(paths.faviconSrc, favicon);

  // fonts task
  watch(paths.fontsSrc, fonts);

  // php task
  watch(paths.phpSrc, php);

  // main script file task
  watch(paths.mainJsSrc, mainScriptFile);

  // js plugins task
  watch([...paths.nodeModules.scripts, paths.scriptsSrc, '!'+paths.mainJsSrc], jsPlugins);

  cb();
};

// export public tasks to be run by the gulp command
module.exports = {
  html,
  mainStyleFile,
  cssLibraries,
  images,
  favicon,
  fonts,
  php,
  mainScriptFile,
  jsPlugins,
  zipper,

  // default task
  default: parallel(watcher)
};
