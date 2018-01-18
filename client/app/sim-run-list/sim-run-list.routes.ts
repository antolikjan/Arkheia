'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/simruns/:id', {
      template: function(param) {
        return '<sim-run-list idd=' + param.id + '></sim-run-list>';
      }
    }).when('/simruns', {
      template: '<sim-run-list></sim-run-list>',
    }).when('/simsearch/:id', {
      template: function(param) {
        return '<sim-run-list search=' + param.id + '></sim-run-list>';
      }
    });
}
