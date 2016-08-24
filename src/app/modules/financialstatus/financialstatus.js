/* jshint node: true */

'use strict';

var financialstatusModule = angular.module('hod.financialstatus', ['ui.router']);

financialstatusModule.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // define a route for the question re student type
  $stateProvider.state({
    name: 'financialStatus',
    url: '/financial-status-query',
    title: 'Financial Status Query',
    parent: 'default',
    views: {
      'content@': {
        templateUrl: 'modules/financialstatus/financialstatus.html',
        controller: 'FinancialstatusCtrl'
      },
    },
  });

  // define a route for the details of the form
  $stateProvider.state({
    name: 'financialStatusStudentType',
    url: '/:studentType',
    title: 'Financial Status Query',
    parent: 'financialStatus',
    views: {
      'content@': {
        templateUrl: 'modules/financialstatus/financialstatusDetails.html',
        controller: 'FinancialstatusDetailsCtrl'
      },
    },
  });
}]);


financialstatusModule.factory('FinancialstatusService', [function () {
  var finStatus;

  // get the form details
  this.getDetails = function () {
    return finStatus;
  };

  // get the defaults
  this.getBlank = function () {
    return {
      studentType: '',
      toDate: '',
      innerLondonBorough: null,
      courseStartDate: '',
      courseEndDate: '',
      totalTuitionFees: '',
      tuitionFeesAlreadyPaid: '',
      accommodationFeesAlreadyPaid: '',
      numberOfDependants: '',
      sortCode: '',
      accountNumber: '',
      dob: ''
    };
  };

  // get the available types
  this.getStudentTypes = function () {
    return [
      {
        value: 'nondoctorate',
        label: 'Tier 4 (General) student',
      },
      {
        value: 'doctorate',
        label: 'Tier 4 (General) doctorate extension scheme)'
      },
      {
        value: 'pgdd',
        label: 'Tier 4 (General) student (postgraduate doctor or dentist)'
      },
      {
        value: 'sso',
        label: 'Tier 4 (General) student (sabbatical officer)'
      }
    ];
  };

  // on first run set status to blank
  finStatus = this.getBlank();

  return this;
}]);


// make a selection as to which type of student we're interested in
financialstatusModule.controller(
'FinancialstatusCtrl', ['$scope', '$state', 'FinancialstatusService',
function ($scope, $state, FinancialstatusService) {
  $scope.studentTypeOptions = FinancialstatusService.getStudentTypes();
  $scope.finStatus = FinancialstatusService.getDetails();

  $scope.typeSubmit = function () {
    if ($scope.finStatus.studentType) {
      // simply go to the appropriate page for this student type
      $state.go('financialStatusStudentType', {studentType: $scope.finStatus.studentType});
    }
  };
}]);


// fill in the details of the form
financialstatusModule.controller(
'FinancialstatusDetailsCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'FinancialstatusService', 'IOService', '$window', '$timeout',
function ($rootScope, $scope, $state, $stateParams, FinancialstatusService, IOService, $window, $timeout) {

  var sType = _.findWhere(FinancialstatusService.getStudentTypes(), {value: $stateParams.studentType});
  if (!sType) {
    // this is not a valid student type option - abort!
    $state.go('financialStatus');
    return;
  }

  $scope.conf = {
    toDate: {
      errors: {
        required: {
          msg: 'Enter a valid end date',
          summary: 'The end date is invalid'
        }
      },
      onChange: function (before, after) {
        console.log('onChange', before, after);
      },
    },
    london: {
      inline: true,
      errors: {
        required: {
          summary: 'The in London option is invalid'
        }
      }
    },
    courseStartDate: {
      hidden: (sType.value === 'doctorate') ? true : false,
    },
    courseEndDate: {
      hidden: (sType.value === 'doctorate') ? true : false,
    },
    totalTuitionFees: {
      hidden: (sType.value !== 'nondoctorate') ? true : false,
      prefix: '£ ',
      errors: {
        required: {
          summary: 'The total tuition fees is invalid',
          msg: 'Enter a valid total tuition fees'
        }
      }
    },
    tuitionFeesAlreadyPaid: {
      hidden: (sType.value !== 'nondoctorate') ? true : false,
      prefix: '£ '
    },
    accommodationFeesAlreadyPaid: {
      prefix: '£ '
    },
    numberOfDependants: {
      classes: { 'form-control-1-8': true }
    },
    dob: {

    }
  };

  $scope.finStatus = FinancialstatusService.getDetails();
  $scope.finStatus.studentType = sType.value;
  $scope.yesNoOptions = [{label: 'Yes', value: true}, {label: 'No', value: false}];
  $scope.pageTitle = sType.label;

  $scope.validfunc = function (val) {
    return true;
  }

  $scope.detailsSubmit = function () {
    // make a copy of the finStatus object and delete fields we don't want to send
    var details = angular.copy(FinancialstatusService.getDetails());
    var sortCode = details.sortCode;
    var accountNumber = details.accountNumber;

    // if (!showTuition) {
    //   delete(details.totalTuitionFees);
    //   delete(details.tuitionFeesAlreadyPaid);
    // }

    delete details.sortCode;
    delete details.accountNumber;

    var url = 'pttg/financialstatusservice/v1/accounts/' + sortCode + '/' + accountNumber + '/dailybalancestatus';

    IOService.get(url, details).then(function (result) {
      console.log('Result', result);
    }, function (err) {
      console.log(err);
    });
  };
}]);



// http://127.0.0.1:8001/pttg/financialstatusservice/v1/accounts/222222/12345678/dailybalancestatus?accommodationFeesAlreadyPaid=2&courseLength=2&innerLondonBorough=&numberOfDependants=2&studentType=&toDate=2016%2F7%2F21&totalTuitionFees=2&tuitionFeesAlreadyPaid=2

// http://127.0.0.1:8001/pttg/financialstatusservice/v1/accounts/222222/12345678/dailybalancestatus?accommodationFeesAlreadyPaid=2&courseLength=2&innerLondonBorough=true&numberOfDependants=2&studentType=&toDate=2016-07-21&totalTuitionFees=2&tuitionFeesAlreadyPaid=2


