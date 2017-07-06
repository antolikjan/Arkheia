'use strict';

export default function($routeProvider) {
  'ngInject';
  $routeProvider
    .when('/results/:simRunId', {
      template: '<results></results>',
    });
}
