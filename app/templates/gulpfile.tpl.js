// Generated on <%= date %> using <%= name %> <%= version %>
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

gulp.task('styles', () => {
  return gulp
    .src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe(
      $.sass
        .sync({
          outputStyle: 'expanded',
          precision: 10,
          includePaths: [
            '.',<% if (includeBootstrap) { %>
            'node_modules/bootstrap/scss',<% } %>
            'node_modules/normalize-scss/sass'
          ]
        })
        .on('error', $.sass.logError)
    )
    .pipe(
      $.postcss([
        autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']})
      ])
    )
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp
    .src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('views', () => {
  return gulp
    .src('app/*.pug')
    .pipe($.plumber())
    .pipe($.pug({pretty: true}))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

function lint(files) {
  return gulp
    .src(files)
    .pipe($.eslint({fix: true}))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js').pipe(gulp.dest('app/scripts'));
});

gulp.task('html', ['views', 'styles', 'scripts'], () => {
  return gulp
    .src(['app/*.html', '.tmp/*.html'])
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if(/\.css$/, $.postcss([
      cssnano({
        safe: true,
        autoprefixer: false,
        discardComments: {removeAll: true}
      })
    ])))
    .pipe($.if('*.css', $.rev()))
    .pipe($.revReplace())
    .pipe(
      $.if(
        /\.html$/,
        $.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: {compress: {drop_console: true}},
          processConditionalComments: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        })
      )
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp
    .src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp
    .src('app/fonts/**/*')
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
  return gulp
    .src(['app/*', '!app/*.html', '!app/*.pug'], {
      dot: true
    })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean'], ['views', 'styles', 'scripts', 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app']
      }
    });

    gulp
      .watch(['app/*.html', 'app/images/**/*', '.tmp/fonts/**/*'])
      .on('change', reload);

    gulp.watch('app/**/*.pug', ['views']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});
