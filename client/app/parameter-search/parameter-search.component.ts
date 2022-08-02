"use strict";
const angular = require("angular");
const ngRoute = require("angular-route");

import routes from "./parameter-search.routes";

export class ParameterSearchComponent {
  parameterSearches = [];
  file_path1;
  file_path2;
  paramsearch_name;
  $http;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  deleteParamSearch(id) {
    // Delete the parameter search from db
    this.$http.get("/api/simulation-runs/delete_parameter_search/" + id).then((res) => {
      // Update the view
      this.$http.get("/api/simulation-runs/param_search_list").then((response) => {
        this.parameterSearches = response.data;
      });
    });
  }

  insertParamSearch() {
    if (this.file_path2) {
      this.$http
        .post("/api/simulation-runs/merge_and_insert_repository", {
          file_name1: this.file_path1,
          file_name2: this.file_path2,
        })
        .then((response) => {
          this.parameterSearches = response.data;
        });
    } else {
      this.$http
        .post("/api/simulation-runs/insert_repository", { file_name: this.file_path1, paramsearch_name: this.paramsearch_name })
        .then((response) => {
          this.parameterSearches = response.data;
        });
    }
  }

  $onInit() {
    this.$http.get("/api/simulation-runs/param_search_list").then((response) => {
      this.parameterSearches = response.data;
    });
  }
}

export default angular
  .module("mozaikRepositoryApp.parameter-search", [ngRoute])
  .config(routes)
  .component("parameterSearch", {
    template: require("./parameter-search.html"),
    controller: ParameterSearchComponent,
    //controllerAs: 'parameterSearchCtrl'
  }).name;
