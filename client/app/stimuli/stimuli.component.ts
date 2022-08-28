"use strict";
const angular = require("angular");
const ngRoute = require("angular-route");
const smartTable = require("angular-smart-table");

import { convertJsonToTree } from "../utility";
require("../../bower_components/angular-bootstrap-lightbox");
import "../../bower_components/angular-ui-tree/dist/angular-ui-tree.js";
import "../../bower_components/angular-ui-tree/dist/angular-ui-tree.css";

import routes from "./stimuli.routes";

export class StimuliComponent {
  $http;
  $uibModal;
  lightbox;
  simRun;
  simRunId;
  data;
  gifs = [];

  /*@ngInject*/
  constructor($http, $route, Lightbox, $uibModal) {
    this.$http = $http;
    this.simRunId = $route.current.params.simRunId;
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
        console.log(data);
        this.data = data;
      },
    });
  }

  openLightboxModal(index) {
    this.lightbox.openModal(this.gifs, index);
  }

  $onInit() {
    this.$http
      .get("/api/simulation-runs/result/" + this.simRunId)
      .then((response) => {
        this.simRun = response.data;
        for (let stim of this.simRun.stimuli) {
          stim.data = convertJsonToTree(stim.params);
          this.gifs.push({
            url: "/api/simulation-runs/images/" + stim.gif,
          });
        }
      });
  }
}

export default angular
  .module("mozaikRepositoryApp.stimuli", [
    ngRoute,
    smartTable,
    "bootstrapLightbox",
    "ui.bootstrap",
    "ui.tree",
  ])
  .config(routes)
  .component("stimuli", {
    template: require("./stimuli.html"),
    controller: StimuliComponent,
    //controllerAs: 'stimuliCtrl'
  }).name;
