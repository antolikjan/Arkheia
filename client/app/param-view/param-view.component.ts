'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
import '../../bower_components/angular-ui-tree/dist/angular-ui-tree.js';
import '../../bower_components/angular-ui-tree/dist/angular-ui-tree.css';

import routes from './param-view.routes';

export class ParamViewComponent {

  $http;
  simRun;
  resId;
  data;

  counter = 0;

  convertJsonToTree(json) {
      let nodes = [];
      for (let key in json) {
        if(json.hasOwnProperty(key))
        this.counter++;
        if (typeof(json[key]) === 'object') {
          if (json[key] instanceof Array) {
              nodes.push({
                          'nodes' : [],
                          'title' : key,
                          'value' : json[key],
                          'id' : this.counter,
              });
          } else {
            nodes.push({
                        'nodes' : this.convertJsonToTree(json[key]),
                        'title' : key,
                        'id' : this.counter,
            });
          }
        } else {
            nodes.push({
                        'nodes' : [],
                        'title' : key,
                        'value' : json[key],
                        'id' : this.counter,
            });
        }
      }
      return nodes;
  }

  /*@ngInject*/
  constructor($http, $route) {
    this.$http = $http;
    this.resId = $route.current.params.simRunId;
  }

  $onInit() {
    this.$http.get('/api/simulation-runs/result/' + this.resId).then(response => {
      this.simRun = response.data;
      this.data = this.convertJsonToTree(JSON.parse(this.simRun.parameters));
    });


  }
}

export default angular.module('mozaikRepositoryApp.param-view', [ngRoute, 'ui.tree'])
  .config(routes)
  .config(function(treeConfig) {
    treeConfig.defaultCollapsed = true; // collapse nodes by default
  })
  .component('paramView', {
    template: require('./param-view.html'),
    controller: ParamViewComponent,
    //controllerAs: 'paramViewCtrl'
  })
  .name;
