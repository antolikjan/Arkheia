'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
const smartTable  = require('angular-smart-table')

require('../../bower_components/angular-bootstrap-lightbox');

import routes from './results.routes';

export class ResultsComponent {
  $http;
  lightbox;
  simRun;
  resId;
  images = [];

  /*@ngInject*/
  constructor($http, $route, Lightbox) {
    this.$http = $http;
    this.resId = $route.current.params.simRunId;
    this.lightbox = Lightbox;
  }

  openLightboxModal(index) {
    this.lightbox.openModal(this.images, index);
  };


  $onInit() {
    this.$http.get('/api/simulation-runs/result/' + this.resId).then(response => {
      this.simRun = response.data;
      for (let res of this.simRun.results)
      {
        this.images.push({
          'url': '/api/simulation-runs/images/' + res.figure._id
          //'caption': res.file_name,
          //'thumbUrl': 'thumb1.jpg' // used only for this example
        });
      }
    });
  }
}

export default angular.module('mozaikRepositoryApp.results', [ngRoute, smartTable, 'bootstrapLightbox'])
  .config(routes)
  .component('results', {
    template: require('./results.html'),
    controller: ResultsComponent,
    //controllerAs: 'resultsCtrl'
  })
  .name;
