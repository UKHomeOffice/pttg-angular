/* global jasmine */

// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['tests/form-*.spec.js'],
  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter')
    // add jasmine spec reporter
    jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}))
  },
  jasmineNodeOpts: {
    print: function () {}
  }
}
