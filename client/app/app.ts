'use strict';
const angular = require('angular');
const ngCookies = require('angular-cookies');
const ngResource = require('angular-resource');
const ngSanitize = require('angular-sanitize');
const ngRoute = require('angular-route');
const uiBootstrap = require('angular-ui-bootstrap');
require('showdown');
require('angular-markdown-directive');

import { routeConfig, markdownConfig } from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import SimRunListComponent from './sim-run-list/sim-run-list.component';
import ParamViewComponent from './param-view/param-view.component';
import StimuliComponent from './stimuli/stimuli.component';
import ResultsComponent from './results/results.component';
import AboutComponent from './about/about.component';
import DocumentationComponent from './documentation/documentation.component';
import ExperimentalProtocolComponent from './experimental-protocol/experimental-protocol.component';
import ParameterSearchComponent from './parameter-search/parameter-search.component';
import ParamSearchInspectComponent from './param-search-inspect/param-search-inspect.component';

import constants from './app.constants';
import util from '../components/util/util.module';



import './app.css';

angular.module('arkheiaApp', [
  ngCookies,
  ngResource,
  ngSanitize,
  'btford.markdown',
  ngRoute,
  uiBootstrap,

  SimRunListComponent,
  ParamViewComponent,
  ResultsComponent,
  StimuliComponent,
  AboutComponent,
  DocumentationComponent,
  ExperimentalProtocolComponent,
  ParameterSearchComponent,
  ParamSearchInspectComponent,

  _Auth,
  account,
  admin,
  navbar,
  //footer,
  constants,
  util
])
  .config(routeConfig).config(['markdownConverterProvider', markdownConfig])
  .run(function ($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedIn(function (loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/about');
        }
      });
    });
  });

angular
  .element(document)
  .ready(() => {
    angular.bootstrap(document, ['arkheiaApp'], {
      strictDi: true
    });
  });
