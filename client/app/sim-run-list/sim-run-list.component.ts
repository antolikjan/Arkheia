'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './sim-run-list.routes';

export class SimRunListComponent {
  $http;
  simulationRuns = [];
  idd;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    if (this.idd === 'false') {
      this.$http.get('/api/simulation-runs').then(response => {
        this.simulationRuns = response.data;
      });
    } else {
      this.$http.get('/api/simulation-runs/param_search/' + this.idd).then(response => {
        this.simulationRuns = response.data.simulation_runs;
      });
    }
  }

}

export default angular.module('mozaikRepositoryApp.sim-run-list', [ngRoute])
  .config(routes)
  .component('simRunList', {
    template: require('./sim-run-list.html'),
    controller: SimRunListComponent,
    bindings : {
      idd : '@'
    }
    //controllerAs: 'simRunListCtrl'
  })
  .name;
