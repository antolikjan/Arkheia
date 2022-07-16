'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');

import { convertJsonToTree } from '../utility';
import routes from './experimental-protocol.routes';

export class ExperimentalProtocolComponent {
  $http;
  $uibModal;
  simRun;
  simRunId;

  /*@ngInject*/
  constructor($http, $route, $uibModal) {
    this.$http = $http;
    this.simRunId = $route.current.params.simRunId;
    this.$uibModal = $uibModal;
  }

  paramsModal(data) {
    this.$uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title-bottom',
      ariaDescribedBy: 'modal-body-bottom',
      template: require('../param-view/param-view.html'),
      controllerAs: '$ctrl',
      controller: function () {
        console.log(data);
        this.data = data;
      }
    });
  }

  $onInit() {
    this.$http.get('/api/simulation-runs/result/' + this.simRunId).then(response => {
      this.simRun = response.data;

      for (let ep of this.simRun.experimental_protocols) {
        ep.data = convertJsonToTree(ep.params);

      }
      for (let re of this.simRun.recorders) {
        re.data = convertJsonToTree(re.params);
      }
    });
  }
}

export default angular.module('mozaikRepositoryApp.experimental-protocol', [ngRoute, 'ui.bootstrap'])
  .config(routes)
  .component('experimentalProtocol', {
    template: require('./experimental-protocol.html'),
    controller: ExperimentalProtocolComponent,
    //controllerAs: 'experimentalProtocolCtrl'
  })
  .name;
