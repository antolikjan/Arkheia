"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider
    .when("/documentation", {
      template: "<documentation></documentation>",
    })
    .when("/documentation/api", {
      template:
        '<ng-include class="doc-md" src="\'/assets/documentation/api.html\'"></ng-include>',
    })
    .when("/documentation/client", {
      template:
        '<ng-include class="doc-md" src="\'/assets/documentation/client.html\'"></ng-include>',
    })
    .when("/documentation/install", {
      template:
        '<ng-include class="doc-md" src="\'/assets/documentation/installation.html\'"></ng-include>',
    });
}
