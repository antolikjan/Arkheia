"use strict";

export default function ($routeProvider) {
  "ngInject";
  $routeProvider.when("/param-search-inspect/:id", {
    template: "<param-search-inspect></param-search-inspect>",
  });
}
