'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
require('../../bower_components/angular-bootstrap-lightbox');

import routes from './stimuli.routes';

export class StimuliComponent {

  $http;
  $uibModal;
  lightbox;
  simRun;
  simRunId;
  gifs = [];

  /*@ngInject*/
  constructor($http, $route, Lightbox, $uibModal) {
    this.$http = $http;
    this.simRunId = $route.current.params.simRunId;
    this.lightbox = Lightbox;
    this.$uibModal = $uibModal;
  }

  paramsModal(params) {
    this.$uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title-bottom',
      ariaDescribedBy: 'modal-body-bottom',
      template: '<div ng-repeat="p in $ctrl.params" style="margin:10px"><span uib-tooltip="{{p[2]}}" tooltip-placement="left" style="width:300px;float : left;">{{p[0]}}</span> <span>{{p[1]}}</span></div>',
      controllerAs : '$ctrl',
      controller: function() {
        this.params = params;
      }
    });
  }

  openLightboxModal(index) {
    this.lightbox.openModal(this.gifs, index);
  };

  $onInit() {
    this.$http.get('/api/simulation-runs/result/' + this.simRunId).then(response => {
    this.simRun = response.data;
    for (let stim of this.simRun.stimuli) {
        this.gifs.push({
          'url': '/api/simulation-runs/images/' + stim.gif,
          //'caption': res.file_name,
          //'thumbUrl': 'thumb1.jpg' // used only for this example
        });
      }
    });
  }
}

export default angular.module('mozaikRepositoryApp.stimuli', [ngRoute, 'bootstrapLightbox',   'ui.bootstrap'])
  .config(routes)
  .component('stimuli', {
    template: require('./stimuli.html'),
    controller: StimuliComponent,
    //controllerAs: 'stimuliCtrl'
  })
  .name;
