'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/documentation', {
      template: '<documentation></documentation>'
    }).when('/documentation/api', {
      template: '<ng-include src="\'/app/documentation/docs/api.html\'"></ng-include>'
    }).when('/documentation/client', {
      template: '<ng-include src="\'/app/documentation/docs/client.html\'"></ng-include>'
    });

}
