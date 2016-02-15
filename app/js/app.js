'use strict';

/* App Module */

var schedulerApp = angular.module('schedulerApp', [
  'ngRoute',
  'schedulerControllers'
]);

schedulerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/scheduler', {
        templateUrl: 'partials/scheduler.html',
        controller: 'SchedulerCtrl'
      }).
      otherwise({
        redirectTo: '/scheduler'
      });
  }]);
