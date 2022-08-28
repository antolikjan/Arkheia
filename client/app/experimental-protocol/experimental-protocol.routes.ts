"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider.when("/experimental-protocol/:simRunId", {
    template: "<experimental-protocol></experimental-protocol>",
  });
}
