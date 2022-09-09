"use strict";
const angular = require("angular");
const ngRoute = require("angular-route");
const smartTable = require("angular-smart-table");

import { convertJsonToTree } from "../utility";

import "../../bower_components/angular-ui-tree/dist/angular-ui-tree.js";
import "../../bower_components/angular-ui-tree/dist/angular-ui-tree.css";

require("../../bower_components/angular-bootstrap-lightbox");

import routes from "./results.routes";

export class ResultsComponent {
  $http;
  lightbox;
  simRun;
  resId;
  $uibModal;
  images: any = [];

  /*@ngInject*/
  constructor($http, $route, Lightbox, $uibModal) {
    this.$http = $http;
    this.resId = $route.current.params.simRunId;
    this.lightbox = Lightbox;
    this.$uibModal = $uibModal;
  }

  paramsModal(data) {
    this.$uibModal.open({
      animation: true,
      ariaLabelledBy: "modal-title-bottom",
      ariaDescribedBy: "modal-body-bottom",
      template: require("../param-view/param-view.html"),
      controllerAs: "$ctrl",
      controller: function () {
        this.data = data;
      },
    });
  }

  openLightboxModal(index) {
    console.log(this.images, index);
    this.lightbox.openModal(this.images, index);
  }

  $onInit() {
    this.$http
      .get("/api/simulation-runs/result/" + this.resId)
      .then((response) => {
        this.simRun = response.data;

        for (let res of this.simRun.results) {
          res.data = convertJsonToTree(res.parameters);
          this.images.push({
            url: "/api/simulation-runs/images/" + res.figure._id,
            //'caption': res.file_name,
            //'thumbUrl': 'thumb1.jpg' // used only for this example
          });
        }
      });
  }
}

export default angular
  .module("mozaikRepositoryApp.results", [
    ngRoute,
    smartTable,
    "bootstrapLightbox",
  ])
  .config(routes)
  .component("results", {
    template: require("./results.html"),
    controller: ResultsComponent,
    //controllerAs: 'resultsCtrl'
  }).name;
