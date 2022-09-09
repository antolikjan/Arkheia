"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider.when("/stimuli/:simRunId", {
    template: "<stimuli></stimuli>",
  });
}
