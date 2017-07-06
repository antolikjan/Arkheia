//'use strict';
const angular = require('angular');
const ngRoute = require('angular-route');
require('../../bower_components/angularjs-slider');
require('../../bower_components/angularjs-slider/dist/rzslider.css');


import routes from './param-search-inspect.routes';

import './param-search-inspect.css';


export class ParamSearchInspectComponent {
  /*@ngInject*/
  $http;
  $q;
  lightbox;

  // GUI MODEL
  parameterNameRadioModel = '';
  selectedParamValues = {};
  disabledParamValues = {};
  figuresToDisplay = [];
  yParameterValues = [];
  xParameterValues = [];
  horizontalParameterValues = [];
  infoPane = '';
  selectedFigure = '';
  image_size = 400;
  image_hw_ratio = 1;
  param_combs;
  varying_params = {};
  idd;
  simulationRuns = [];
  file_names = {};
  precission = 4; // The number of decimal places to which parameter values are compared for equality.
  param_combs_vis = true;
  empty_figure_counter = 0;

  constructor($route, $http, $q, Lightbox) {
    this.idd = $route.current.params.id;
    this.$http = $http;
    this.$q = $q;
    this.lightbox = Lightbox;
  }

  unique(x) {
      let d = {};
      for (let a of x)
      {
        d[a] = true;
      }
      return Object.keys(d);
    }

  assertCount = 0;
  assert(cond, string) {
    if (!cond) {
      this.infoPane = this.assertCount + ' :' + string;
      this.assertCount = this.assertCount + 1;
    }
  }

  values(dict) {
    let keys = Object.keys(dict);
    return keys.map(function(v) { return dict[v]; });
  }

  falseKeys(dict) {
    let false_keys = [];
    for (let k in dict) {
      if (dict[k] === false) { false_keys.push(k); }
    }
    return false_keys;
  }

  openLightboxModal(figures) {
    let images = [];
    let i = 0;
    let index  = 0;
    for (let k in figures) {
      if (figures.hasOwnProperty(k)) {
        //@import 'parameter-search/parameter-search.css';
        images.push({'url' : '/api/simulation-runs/images/' + figures[k]._id});
        if (k === this.selectedFigure) { index = i; }
        i = i + 1;
      }
    }
    this.lightbox.openModal(images, index);
  };


  updateButtonActivation() {
      for (let k in this.selectedParamValues) {
        if (this.selectedParamValues.hasOwnProperty(k)) {
          if (this.falseKeys(this.selectedParamValues[k]).length === 1) {
              for (let vn in this.selectedParamValues[k]) {
                 if (!this.selectedParamValues[k][vn]) { this.disabledParamValues[k][vn] = true; }
              }
          }

          if (this.falseKeys( this.selectedParamValues[k] ).length === 2) {
              for (let vn in this.selectedParamValues[k]) {
                if (this.selectedParamValues[k].hasOwnProperty(vn)) {
                  this.disabledParamValues[k][vn] = false;
                }
              }
          }
        }
      }
  }


  identifySelectedVaryingAndNonVaryingParamers() {
      let vary = [];
      let nonVary = [];
      for (let k in this.selectedParamValues) {
        // with the exception of the one selected for y-axis = parameterNameRadioModel
        if (k !== this.parameterNameRadioModel) {
          if (this.values(this.selectedParamValues[k]).reduce(function (pre, cur) { if (!cur) { return pre + 1; } else { return pre; } }, 0) > 1) {
            vary.push(k);
          } else {
            nonVary.push(k);
          }
        }
      }
      return [vary, nonVary];
  }

  findImagesForParameterCombinations(parameterNames, parameterValues, parPath, paramCombs) {
    this.assert(parameterNames.length === parameterValues.length, 'parameterNames have to have the same length as parameterValues');
    let figuresToDisplay = [];
    let parCombs = [];

    for (let v of parameterValues[0] ) {
      if (parameterNames.length > 1) {
         let [im, pc] = this.findImagesForParameterCombinations(parameterNames.slice().splice(1),
                                                               parameterValues.slice().splice(1),
                                                               parPath.concat([[parameterNames[0], v]]),
                                                               paramCombs.filter((x) => {
                                                                                         return parseFloat(x[parameterNames[0]]).toFixed(this.precission) ===
                                                                                         parseFloat(v).toFixed(this.precission);
                                                                                       })
                                                 );
         figuresToDisplay = figuresToDisplay.concat(im);
         parCombs = parCombs.concat(pc);
      } else {
        let pc = paramCombs.filter((x) => { return parseFloat(x[parameterNames[0]]).toFixed(this.precission) === parseFloat(v).toFixed(this.precission); });
        this.assert(pc.length <= 1, 'There shouldn\'t be more than one parameter combination left!');
        if (pc.length === 0) {
           figuresToDisplay = figuresToDisplay.concat(['EmptyFigure' + this.empty_figure_counter]);
           this.empty_figure_counter = this.empty_figure_counter + 1;
        } else {
           figuresToDisplay = figuresToDisplay.concat(pc[0].figures);
        }
        parCombs = parCombs.concat([parPath.concat([[parameterNames[0], v]])]);
      }
    }
    return [figuresToDisplay, parCombs];
  }

  updateImagesAndParameterGuides() {
    let [varyingSelectedParameters, nonVaryingSelectedParameters] = this.identifySelectedVaryingAndNonVaryingParamers();

    this.assert(this.values(this.selectedParamValues[this.parameterNameRadioModel]).some((v) => !v), 'Error y parameter without selected values');

    let varyingParamCombs = this.param_combs;

    // lets exclude non-varying parameters from the param_combs
    for (let nvp of nonVaryingSelectedParameters) {
        // get the selected value of the non-varying parameter
        let v = this.falseKeys(this.selectedParamValues[nvp]);
        this.assert(v.length === 1, 'This parameter should have had exactly one value selected');
        varyingParamCombs = varyingParamCombs.filter((x) => { return parseFloat(x[nvp]).toFixed(this.precission) === parseFloat(v[0]).toFixed(this.precission); });
    }

    let varyingSelectedParametersValues = [];

    for (let i in varyingSelectedParameters) {
      if (varyingSelectedParameters.hasOwnProperty(i)) {
        varyingSelectedParametersValues[i] = this.falseKeys(this.selectedParamValues[varyingSelectedParameters[i]]);
      }
    }

    this.figuresToDisplay = [];
    let vs = this.falseKeys(this.selectedParamValues[this.parameterNameRadioModel]);

    this.yParameterValues = [];

    for (let i in vs) {
      if (vs.hasOwnProperty(i)) {
        let pv = varyingParamCombs.filter((x) => { return parseFloat(x[this.parameterNameRadioModel]).toFixed(this.precission) === parseFloat(vs[i]).toFixed(this.precission); });
        this.yParameterValues[i] = [this.parameterNameRadioModel, vs[i]];
        if (varyingSelectedParameters.length === 0) {
            this.assert(pv.length === 1, 'We would expcet to have only one prameter combination at this point!');
            this.figuresToDisplay[i] = [pv[0].figures];
        } else {
            let [figs, pc] = this.findImagesForParameterCombinations(varyingSelectedParameters, varyingSelectedParametersValues, [], pv);
            this.xParameterValues = pc;
            this.figuresToDisplay[i] = figs;
        }
      }
    }
    // just a sanity check
    this.assert(this.xParameterValues.length === this.figuresToDisplay[0].length, 'The number of parameter combinations doesn\'t correspond to the x length of figures matrix.');
    for (let v of this.figuresToDisplay){ this.assert(v.length === this.figuresToDisplay[0].length, 'We would expect all image lines to have the same length!'); }
  }

  update() {
      this.updateImageInfo();
      this.updateImagesAndParameterGuides();
  }

  updateImageInfo() {
    let src = '';
    for (let a in this.figuresToDisplay) {
      if (this.figuresToDisplay.hasOwnProperty(a)) {
        for (let b in this.figuresToDisplay[a]) {
          if (this.figuresToDisplay[a].hasOwnProperty(b)) {
            if (this.figuresToDisplay[a][b][this.selectedFigure] !== undefined) {
             src = '/api/simulation-runs/images/' + this.figuresToDisplay[a][b][this.selectedFigure]._id;
             break;
            }
          }
        }
      }
    }

    let context = this;

    this.$q(function(resolve, reject) {
        let image = new Image();
        (<any>image).context = context;
        image.onload = function() {
            (<any>image).context.image_hw_ratio = image.height / image.width;
            console.log(image.height / image.width);
            resolve(image);
        };
        image.src = src;
    }).then(img => {});
  }

  $onInit() {
      this.$http.get('/api/simulation-runs/param_search/' + this.idd).then(response => {
      this.param_combs = JSON.parse(response.data.parameter_combinations);
      this.simulationRuns = response.data.simulation_runs;
      // Lets find out which parameters actually differ in the parameter combinations
      this.varying_params = {};
      for (let key in this.param_combs[0]) {
        if (this.param_combs.filter((x) => { return parseFloat(x[key]).toFixed(this.precission) === parseFloat(this.param_combs[0][key]).toFixed(this.precission); }).length < this.param_combs.length) {
            this.varying_params[key] = this.unique(this.param_combs.map((x) => { return parseFloat(x[key]).toFixed(this.precission); }));
        }
      }

      this.parameterNameRadioModel = Object.keys(this.varying_params)[0];
      for (let k in this.varying_params) {
        if (this.varying_params.hasOwnProperty(k)) {
          let d = {};
          let d1 = {};
          for (let v in this.varying_params[k]) {
            if (this.varying_params[k].hasOwnProperty(v)) {
              d[this.varying_params[k][v]] = false;
              d1[this.varying_params[k][v]] = false;
            }
          }
          this.selectedParamValues[k] = d;
          this.disabledParamValues[k] = d1;
        }
      }
      // double check the number of parameter combinations and the number of simulation runs match
      if (this.param_combs.length !==  this.simulationRuns.length) {
        console.log('ERROR: number of parameter combinations does not match namber of simulation runs.');
      }

      this.file_names = {};

      for (let i in this.param_combs) {
        if (this.param_combs.hasOwnProperty(i)) {

           // let's reduce and reorganize results as a dictionary holding figure names and keys and 
           // corresponding image urls as values
           let d = {};


           for (let r of this.simulationRuns[i].results) {
             d[r.file_name] = r.figure;
             this.file_names[r.file_name] = true;
           }
           this.param_combs[i].figures = d;
        }
      }
      this.file_names = Object.keys(this.file_names);
      this.selectedFigure = this.file_names[0];
      this.updateImagesAndParameterGuides();
      this.updateImageInfo();

      console.log(this.file_names);
      console.log(this.param_combs);
    });
  }
}

export default angular.module('mozaikRepositoryApp.param-search-inspect', [ngRoute, 'bootstrapLightbox', 'rzModule'])
  .config(routes)
  .component('paramSearchInspect' , {
    template: require('./param-search-inspect.html'),
    controller: ParamSearchInspectComponent,
    //controllerAs: 'paramSearchInspectCtrl'
  }).directive('syncScroll', [function(){
    function combineX(elements) {
      elements.on('scroll', function(e) {
        angular.forEach(elements,
            function (element) {
              if (e.target !== element) {
                    element.scrollLeft = e.target.scrollLeft;
              }
            }
          );
      });
    }
    function combineY(elements) {
      elements.on('scroll', function(e) {
        angular.forEach(elements,
            function (element) {
              if (e.target !== element) {
                    element.scrollTop = e.target.scrollTop;
              }
            }
          );
      });
    }
    return {
      restrict: 'A',
      replace: false,
      compile: function(element, attrs){
          combineX(angular.element(element[0].querySelectorAll('.' + attrs.syncScrollX)));
          combineY(angular.element(element[0].querySelectorAll('.' + attrs.syncScrollY)));
      }
    };
}]).name;
