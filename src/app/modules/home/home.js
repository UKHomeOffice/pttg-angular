/* jshint node: true */

'use strict';

var homeModule = angular.module('hod.home', ['ui.router']);

homeModule.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.state({
    name: 'home',
    url: '/',
    title: 'Home',
    parent: 'default',
    views: {
      'content@': {
        templateUrl: 'modules/home/home.html',
        controller: 'HomeCtrl'
      },
    },
  });
}]);

homeModule.controller('HomeCtrl', ['$rootScope', '$scope', '$state', function ($rootScope, $scope, $state) {
  console.log('HomeCtrl');
}]);