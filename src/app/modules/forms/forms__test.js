var formsTestModule = angular.module('hod.formsTest', ['hod.forms']);

formsTestModule.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // define a route for the question re student type
  $stateProvider.state({
    name: 'formTests',
    url: '/forms-test',
    title: 'Forms test page',
    parent: 'default',
    views: {
      'content@': {
        templateUrl: 'modules/forms/forms__test.html',
        controller: 'FormsTestCtrl'
      },
    },
  });

  $stateProvider.state({
    name: 'formTestsElement',
    url: '/forms-test/:element',
    title: 'Forms test page',
    parent: 'default',
    views: {
      'content@': {
        templateUrl: 'modules/forms/forms__test.html',
        controller: 'FormsTestCtrl'
      },
    },
  });
}]);


formsTestModule.controller('FormsTestCtrl', ['$scope', '$state', function ($scope, $state) {
  $scope.testElement = $state.params.element;
  $scope.values = {
    // text fields
    surname: 'Stuart',
    n: 123,
    max: 10,
    float: 1.25,
    hiddenText: 'Hidden',
    hiddenNumber: 0,

    // radio
    sType: 'xnondoctorate',

    // dates
    start: '',
    end: '1974-05-13',

    //
    sortcode: '123456',
    sortcode2: '',

    hiddenDate: '1974-06-23'
  };

  // config for radio item
  $scope.confType = {
    inline: false,
  };

  $scope.confLondon = {
    inline: true,
    required: false
  };

  $scope.sTypeOptions = [
    { value: 'nondoctorate', label: 'Tier 4 (General) student' },
    { value: 'doctorate', label: 'Tier 4 (General) doctorate extension scheme' },
    { value: 'pgdd', label: 'PGDD' },
    { value: 'sso', label: 'Sabbatical' }
  ];

  $scope.londonOptions = [
    { value: 'yes', label:'Yes' },
    { value: 'no', label:'No' }
  ];

  $scope.confForename = {
    id: 'specficIDcanBeGiven'
  };

  $scope.confSurname = {
    errors: {
      required: {
        msg: 'Surname is required',
        summary: 'Surname is required',
      }
    }
  };

  $scope.confFloat = {
    max: 123,
    float: true,
    errors: {
      max: {
        msg: 'Too big',
        summary: 'Float value is too big'
      }
    }
  };

  $scope.confHiddenText = {
    hidden: true
  };

  $scope.confHiddenNumber = {
    hidden: true,
    max: 999,
    min: 100
  };

  $scope.confEnd = {
    errors: {
      invalid: {
        msg: 'No good',
        summary: 'The end date is unacceptable'
      }
    }
  };

  $scope.confDob = {
    max: '1974-05-13',
    min: '1950-05-13'
  };

  $scope.confHiddenDate = {
    hidden: true
  };

  $scope.submit = function () {
    console.log('Submit');
  };
}]);