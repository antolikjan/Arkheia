"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider.when("/parameter-search", {
    template: "<parameter-search></parameter-search>",
  });
}
