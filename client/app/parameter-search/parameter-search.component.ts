'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './parameter-search.routes';

export class ParameterSearchComponent {
  parameterSearches = [];
  $http;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/simulation-runs/param_search_list').then(response => {
      this.parameterSearches = response.data;
    });
  }
}

export default angular.module('mozaikRepositoryApp.parameter-search', [ngRoute])
  .config(routes)
  .component('parameterSearch', {
    template: require('./parameter-search.html'),
    controller: ParameterSearchComponent,
    //controllerAs: 'parameterSearchCtrl'
  })
  .name;
