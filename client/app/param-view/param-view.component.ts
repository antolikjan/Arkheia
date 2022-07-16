'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
import { convertJsonToTree } from '../utility';
import '../../bower_components/angular-ui-tree/dist/angular-ui-tree.js';
import '../../bower_components/angular-ui-tree/dist/angular-ui-tree.css';

import routes from './param-view.routes';

export class ParamViewComponent {

  $http;
  simRun;
  resId;
  data;

  /*@ngInject*/
  constructor($http, $route) {
    this.$http = $http;
    this.resId = $route.current.params.simRunId;
  }

  $onInit() {
    this.$http.get('/api/simulation-runs/result/' + this.resId).then(response => {
      this.simRun = response.data;

      this.data = convertJsonToTree(JSON.parse(this.simRun.parameters));
      //JSON.parse
    });
  }
}

export default angular.module('mozaikRepositoryApp.param-view', [ngRoute, 'ui.tree'])
  .config(routes)
  .config(function (treeConfig) {
    treeConfig.defaultCollapsed = true; // collapse nodes by default
  })
  .component('paramView', {
    template: require('./param-view.html'),
    controller: ParamViewComponent,
    //controllerAs: 'paramViewCtrl'
  })
  .name;
