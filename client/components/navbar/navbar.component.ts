"use strict";
/* eslint no-sync: 0 */
const angular = require("angular");

export class NavbarComponent {
  menu = [
    {
      title: "Simulation runs",
      link: "/simruns",
    },
    {
      title: "Parameter searches",
      link: "/parameter-search",
    },
    {
      title: "About",
      link: "/about",
    },
    {
      title: "Documentation",
      link: "/documentation",
    },
  ];
  $location;
  isLoggedIn = true;
  isAdmin = true;
  // getCurrentUser: Function;
  isCollapsed = true;
  search = "";

  execSearch() {
    this.$location.path("/simsearch/" + this.search.replace(/\s+/g, "~"));
    console.log(this.search.replace(/\s+/g, "~"));
  }

  constructor($location) {
    "ngInject";
    this.$location = $location;
  }

  isActive(route) {
    return route === this.$location.path();
  }
}

export default angular.module("directives.navbar", []).component("navbar", {
  template: require("./navbar.html"),
  controller: NavbarComponent,
}).name;
