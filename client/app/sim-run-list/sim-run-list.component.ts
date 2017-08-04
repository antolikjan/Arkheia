'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
const smartTable = require('angular-smart-table')
const moment = require('moment');
import routes from './sim-run-list.routes';

export class SimRunListComponent {
  $http;
  $uibModal;
  simulationRuns = [];
  idd;

  /*@ngInject*/
  constructor($http,$uibModal) {
    this.$http = $http;
    this.$uibModal = $uibModal;
  }

  getSubmissionDate(row)
  {
    return moment(row.submission_date,'DD/MM/YYYY-HH:mm:ss').valueOf();
  }

  getRunDate(row)
  {
    return moment(row.run_date,'DD/MM/YYYY-HH:mm:ss').valueOf();
  }

  descriptionModal(docstring) {
    this.$uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title-bottom',
      ariaDescribedBy: 'modal-body-bottom',
      template: '</div><div btf-markdown="$ctrl.docstring"></div>',
      controllerAs : '$ctrl',
      controller: function() {
        this.docstring = docstring;
      }
    });
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

export default angular.module('mozaikRepositoryApp.sim-run-list', [ngRoute,smartTable])
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
