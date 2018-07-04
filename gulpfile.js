var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync').create();

const eslint = require('gulp-eslint');


gulp.task('default', function(){
  console.log("GULP IS IN THE HOUSE, YEAH-YUH! HM,HM!");
  gulp.watch('scss/**/*.scss', gulp.series('styles'));
  gulp.watch('js/**/*.js', gulp.series('lint'));

  browserSync.init({
	server: "./"
  });
  //browserSync.stream();

  //done();	
});


//styles, usage 'gulp styles' on command line
gulp.task('styles', function() {
	gulp.src('scss/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('./css'));
})


gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['js/**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});