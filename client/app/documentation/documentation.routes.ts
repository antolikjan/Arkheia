'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/documentation', {
      template: '<documentation></documentation>'
    }).when('/documentation/api', {
      template: '<ng-include src="\'/app/documentation/api.html\'"></ng-include>'
    }).when('/documentation/client', {
      template: '<ng-include src="\'/app/documentation/client.html\'"></ng-include>'
    }).when('/documentation/install', {
      template: '<ng-include src="\'/app/documentation/installation.html\'"></ng-include>'
    });
}
