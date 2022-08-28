"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider.when("/param-view/:simRunId", {
    template: "<param-view></param-view>",
  });
}
