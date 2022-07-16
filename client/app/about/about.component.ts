'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './about.routes';

export class AboutComponent {

  $http;
  configuration = {
    'wellcome_message': 'Welcome to Arkheia',
    'description_message': 'Do not forget to set your repository description.'
  };

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/simulation-runs/configuration').then(response => {
      console.log(response);
      if (response.data.length === 1) {
        this.configuration = response.data[0];
      } else {
        console.log('the configuration request did not yield single document as expected');
      }
    });
  }

}

export default angular.module('mozaikRepositoryApp.about', [ngRoute])
  .config(routes)
  .component('about', {
    template: require('./about.html'),
    controller: AboutComponent,
  })
  .name;
