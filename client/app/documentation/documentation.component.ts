'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');


import routes from './documentation.routes';

export class DocumentationComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('mozaikRepositoryApp.documentation', [ngRoute])
  .config(routes)
  .component('documentation', {
    template: require('./documentation.html'),
    controller: DocumentationComponent,
  })
  .name;
