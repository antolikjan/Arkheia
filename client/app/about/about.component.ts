'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './about.routes';

export class AboutComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('mozaikRepositoryApp.about', [ngRoute])
  .config(routes)
  .component('about', {
    template: require('./about.html'),
    controller: AboutComponent,
  })
  .name;
