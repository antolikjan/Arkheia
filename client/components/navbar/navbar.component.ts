'use strict';
/* eslint no-sync: 0 */
const angular = require('angular');

export class NavbarComponent {
  menu = [{
    'title': 'Simulation runs',
    'link': '/simruns'
  },
  {
    'title': 'Parameter searches',
    'link': '/parameter-search'
  },
  {
    'title' : 'About',
    'link' : '/about'
  },
  {
    'title' : 'Documentation',
    'link' : '/documentation'
  }
  ];
  $location;
  isLoggedIn: Function;
  isAdmin: Function;
  getCurrentUser: Function;
  isCollapsed = true;
  search = "";

  execSearch(){
    this.$location.path('/simsearch/' + this.search.replace(/\s+/g,'~'))
    console.log(this.search.replace(/\s+/g,'~'))
  }


  constructor($location, Auth) {
    'ngInject';
    this.$location = $location;
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
  }

  isActive(route) {
    return route === this.$location.path();
  }
}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
