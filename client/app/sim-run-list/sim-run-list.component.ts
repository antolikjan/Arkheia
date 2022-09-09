"use strict";
const angular = require("angular");
const ngRoute = require("angular-route");
const smartTable = require("angular-smart-table");
const moment = require("moment");
import routes from "./sim-run-list.routes";

export class SimRunListComponent {
  $http;
  $uibModal;
  simulationRuns = new Array();
  idd;
  search;
  file_path;

  /*@ngInject*/
  constructor($http, $uibModal) {
    this.$http = $http;
    this.$uibModal = $uibModal;
  }

  deleteSimRun(id) {
    console.log("deleting simulation run with an id: " + id);
    // Delete the run from db
    this.$http.get("/api/simulation-runs/delete_simrun/" + id).then((res) => {
      // Update the view
      this.$http.get("/api/simulation-runs").then((response) => {
        this.simulationRuns = response.data;
      });
    });
  }

  getSubmissionDate(row) {
    return moment(row.submission_date, "DD/MM/YYYY-HH:mm:ss").valueOf();
  }

  getRunDate(row) {
    return moment(row.run_date, "DD/MM/YYYY-HH:mm:ss").valueOf();
  }

  descriptionModal(docstring) {
    console.log(docstring);
    this.$uibModal.open({
      animation: true,
      ariaLabelledBy: "modal-title-bottom",
      ariaDescribedBy: "modal-body-bottom",
      template: '</div><div btf-markdown="$ctrl.docstring"></div>',
      controllerAs: "$ctrl",
      controller: function () {
        this.docstring = docstring;
      },
    });
  }

  insertSimrun() {
    this.$http
      .post("/api/simulation-runs/insert_repository", {
        file_name: this.file_path,
      })
      .then((response) => {
        this.$http.get("/api/simulation-runs").then((response) => {
          this.simulationRuns = response.data;
        });
      });
  }

  $onInit() {
    if (this.search !== undefined) {
      console.log("Searcing for: " + this.search);
      this.$http.get("/api/simulation-runs/" + this.search).then((response) => {
        this.simulationRuns = response.data;
      });
    } else if (this.idd !== undefined) {
      this.$http.get("/api/simulation-runs/param_search/" + this.idd).then((response) => {
        this.$http.post("/api/simulation-runs/simruns", response.data.simulation_runs).then((res) => {
          this.simulationRuns = res.data;
        });
      });
    } else {
      this.$http.get("/api/simulation-runs").then((response) => {
        this.simulationRuns = response.data;
      });
    }
  }
}

export default angular
  .module("mozaikRepositoryApp.sim-run-list", [ngRoute, smartTable])
  .config(routes)
  .component("simRunList", {
    template: require("./sim-run-list.html"),
    controller: SimRunListComponent,
    bindings: {
      idd: "@",
      search: "@",
    },
    //controllerAs: 'simRunListCtrl'
  }).name;
