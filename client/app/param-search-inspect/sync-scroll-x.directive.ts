"use strict";
const angular = require("angular");

let mod = angular.module("mozaikRepositoryApp.sync-scroll-x", []);

/*mod.directive('syncScrollX', [function(){
    var scrollLeft = 0;
    function combine(elements){
      elements.on('scroll', function(e){
        if(e.isTrigger){
          e.target.scrollLeft = scrollLeft;
        }else {
          scrollLeft = e.target.scrollLeft;
          elements.each(function (element) {
            if( !this.isSameNode(e.target) ){
              $(this).trigger('scroll');
            }
          });
        }
      });
    }

    return {
      restrict: 'A',
      replace: false,
      compile: function(element, attrs){
        combine(element.find('.'+attrs.combineHorizontalScrolls));
      }
    };
  }]);*/

export default mod;
