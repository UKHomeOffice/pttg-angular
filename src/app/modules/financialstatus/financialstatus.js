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
      accommodationFeesAlreadyPaid: '',
      courseStartDate: '',
      courseEndDate: '',
      innerLondonBorough: null,
      numberOfDependants: '',
      studentType: '',
      toDate: '',
      totalTuitionFees: '',
      tuitionFeesAlreadyPaid: '',
      sortCode: '',
      accountNumber: ''
    };
  };

  // get the available types
  this.getStudentTypes = function () {
    return [
      {
        value: 'nondoctorate',
        label:'Tier 4 (General) student',
      },
      {
        value: 'doctorate',
        label:'Tier 4 (General) doctorate extension scheme'
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
  var element = $window.document.getElementById('pageTitle');
  console.log(element);
  // element.focus();
  $timeout(function () {
    var element = $window.document.getElementById('pageTitle');
    console.log('Timeout', element);
    // element.focus();
  });
  var opt = _.findWhere(FinancialstatusService.getStudentTypes(), {value: $stateParams.studentType});
  var showTuition = (opt.value !== 'doctorate');
  if (!opt) {
    // this is not a valid student type option - abort!
    $state.go('financialStatus');
    return;
  }

  $scope.conf = {};
  $scope.conf.toDate = {
    stdErrors: {
      inline: 'Date is invalid',
      summary: 'The end date is invalid'
    },
    onChange: function (before, after) {
      console.log('onChange', before, after);
    },
  };
  $scope.conf.london = {
    inline: true
  };

  $scope.finStatus = FinancialstatusService.getDetails();
  $scope.selectedType = opt;
  $scope.showTuition = showTuition;
  $scope.yesNoOptions = [{label: 'Yes', value: true}, {label: 'No', value: false}];

  $scope.v = {
    toDate: function () {
      console.log('validation toDate');
      return true;
    },
    courseLength: function (value) {
      return (Number(value) <= 9 && value.length) ? true: false;
    },
    accomPaid: function (value) {
      return (Number(value) <= 1265) ? true: false;
    },
    int: function (value) {
      var n = Number(value);
      return (n === Math.floor(n) && n === Math.ceil(n)) ? true : false;
    },
    accountNumber: function (value) {
      return (Number(value) >= 10000000) ? true : false;
    }
  };

  $scope.validfunc = function (val) {
    console.log('HELLO validfunc', val);
    return true;
  }

  $scope.detailsSubmit = function () {
    // make a copy of the finStatus object and delete fields we don't want to send
    var details = angular.copy(FinancialstatusService.getDetails());
    var sortCode = details.sortCode;
    var accountNumber = details.accountNumber;

    if (!showTuition) {
      delete(details.totalTuitionFees);
      delete(details.tuitionFeesAlreadyPaid);
    }

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


