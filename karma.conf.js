// Karma configuration
// Generated on Tue Dec 10 2013 17:46:22 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],

    plugins: [
      'karma-*'
    ],

    // list of files / patterns to load in the browser
    files: [
      'public/js/angular.min.js',
      'public/js/angular-strap.min.js',
      'public/js/services.js',
      'test/lib/*.js',
      'test/unit/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'junit', 'coverage'],

    preprocessors: {
      'public/js/main.js': ['coverage'],
      'public/js/services.js': ['coverage'],
      'public/tools/*.js': ['coverage'],
      'public/tools/**/*.js': ['coverage']
    },

    coverageReporter: {
      reporters: [
        {
          type: 'cobertura',
          dir: 'coverage/',
          file: 'cobertura-coverage.xml'
        }, {
          type: 'text-summary'
        }
      ]
    },

    // the default configuration
    junitReporter: {
      outputFile: 'xunit.xml'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: ! process.env.JENKINS_HOME,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: !! process.env.JENKINS_HOME
  });
};
