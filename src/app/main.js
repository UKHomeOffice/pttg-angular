var app = angular.module('hod.proving', [
  'ui.router',
  'ngAria',
  'hod.header',
  'hod.io',
  'hod.home',
  'hod.financialstatus',
  'hod.forms',
  'hod.formsTest',
  'hod.ui'
]);


app.constant('CONFIG', {
  api: 'http://127.0.0.1:8081/'//$('html').data('api')
});


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.state({
    name: 'default',
    title: 'HOD',
    views: {
      'content': {
      },
    },
  });
}]);

app.run(['$location', '$rootScope', '$window', '$timeout', function($location, $rootScope, $window, $timeout) {
  // see http://simplyaccessible.com/article/spangular-accessibility/

  // var history; // stores uri of last page viewed - Used to track if we should set focus to main h1
  // var currentURL; // store uri of current page viewed - Used to track if we should set focus to main h1


  $rootScope.$on('$viewContentLoaded', function () {
    // http://stackoverflow.com/questions/25596399/set-element-focus-in-angular-way



    $timeout(function() {
      // var element = $window.document.getElementById('pageTitle');
      // element.focus();
    });

    // if(element) {
    //   element.
    //   element.focus();
    //   console.log('Set focus', element);
    // }
  });
}]);


