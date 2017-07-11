'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/about', {
      template: '<about></about>'
    }).when('/', {
      template: '<about></about>'
    });
}
