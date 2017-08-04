'use strict';

export function routeConfig($routeProvider, $locationProvider) {
  'ngInject';
  $routeProvider
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
}

export function markdownConfig(markdownConverter) {
  //'ngInject';
  
  markdownConverter.config({
  	'headerLevelStart' : 3,
  	'literalMidWordUnderscores' : true,

  });
}
