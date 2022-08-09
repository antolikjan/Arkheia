"use strict";
const angular = require("angular");
const ngRoute = require("angular-route");
const moment = require("moment");

import routes from "./parameter-search.routes";

export class ParameterSearchComponent {
  parameterSearches = [];
  file_path1;
  file_path2;
  paramsearch_name;
  data;
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

  updateVIew() {
    this.data = Array();
    this.$http.get("/api/simulation-runs/param_search_list").then((response) => {
      this.parameterSearches = response.data;
      this.parameterSearches.forEach((element) => {
        this.$http.get("/api/simulation-runs/simruninfo/" + element["simulation_runs"][0]).then((res) => {
          this.data.push([element, res.data]);
        });
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
        .then((res) => {
          this.updateVIew();
        });
    } else {
      this.$http
        .post("/api/simulation-runs/insert_repository", {
          file_name: this.file_path1,
          paramsearch_name: this.paramsearch_name,
        })
        .then((res) => {
          this.updateVIew();
        });
    }
  }

  getRunDate(row) {
    return moment(row.run_date, "DD/MM/YYYY-HH:mm:ss").valueOf();
  }

  $onInit() {
    this.updateVIew();
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
