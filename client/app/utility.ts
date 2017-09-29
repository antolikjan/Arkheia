'use strict';

function _convertJsonToTree(c,json) {
      let counter = c;
      let nodes = [];
      for (let key in json) {
        if(json.hasOwnProperty(key))
        counter++;
        if (typeof(json[key][0]) === 'object') {
          if (json[key][0] instanceof Array) {
              nodes.push({
                          'nodes' : [],
                          'title' : key,
                          'value' : json[key][0],
                          'tooltip' : String(json[key][1]) + " : " + String(json[key][2]),
                          'id' : counter
              });
          } else {
            let res = _convertJsonToTree(counter,json[key][0]);
            nodes.push({
                        'nodes' : res[1],
                        'tooltip' : String(json[key][1]) + " : " + String(json[key][2]),
                        'title' : key,
                        'id' : counter
            });
            counter = res[0];
          }
        } else {
            nodes.push({
                        'nodes' : [],
                        'title' : key,
                        'value' : json[key][0],
                        'tooltip' : String(json[key][1]) + " : " + String(json[key][2]), 
                        'id' : counter
            });
        }
      }
      return [counter,nodes];
}


export function convertJsonToTree(json) {
  return _convertJsonToTree(0,json)[1];
}