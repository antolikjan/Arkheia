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
  showChangingParams = true;
  editing = false;
  $http;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  toggleChangingParams() {
    this.showChangingParams = !this.showChangingParams;
  }

  deleteParamSearch(id) {
    // Delete the parameter search from db
    console.log("Deleting parameter search.");
    this.$http.get("/api/simulation-runs/delete_parameter_search/" + id).then((res) => {
      // Update the view
      this.updateVIew();
      console.log("Done.");
    });
  }

  updateVIew() {
    this.$http.get("/api/simulation-runs/param_search_list").then((response) => {
      this.parameterSearches = response.data;
    });
  }

  changeParamSearchName(id, newName) {
    this.$http.post("/api/simulation-runs/change_param_search_name/", { name: newName, _id: id }).then((response) => {
      console.log("Name changed.");
    });
    this.editing = false;
  }

  insertParamSearch() {
    if (this.file_path2) {
      console.log("Inserting parameter search.");
      this.$http
        .post("/api/simulation-runs/merge_and_insert_repository", {
          file_name1: this.file_path1,
          file_name2: this.file_path2,
        })
        .then((res) => {
          this.updateVIew();
          console.log("Done.");
        });
    } else {
      console.log("Inserting parameter search.");
      this.$http
        .post("/api/simulation-runs/insert_repository", {
          file_name: this.file_path1,
          paramsearch_name: this.paramsearch_name,
        })
        .then((res) => {
          this.updateVIew();
          console.log("Done.");
        });
    }
  }

  getRunDate(row) {
    return moment(row.run_date, "DD/MM/YYYY-HH:mm:ss").valueOf();
  }

  getSubmissionDate(row) {
    return moment(row.submission_date, "DD/MM/YYYY-HH:mm:ss").valueOf();
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
