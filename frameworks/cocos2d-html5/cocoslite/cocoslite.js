cl = cl ? cl : {};


(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    cl.defineGetterSetter = function(obj, attr, getter, setter){
        if(typeof attr === 'string') {

            // define getter
            if(typeof getter == 'function')
                obj.__defineGetter__(attr, getter);
            else if(typeof getter == 'string')
                obj.__defineGetter__(attr, obj[getter]);
            
            // define setter
            if(typeof setter == 'function')
                obj.__defineSetter__(attr, setter);
            else if(typeof setter == 'string')  
                obj.__defineSetter__(attr, obj[setter]);

        } else if(typeof attr === 'object') {
            for(var p in attr) {
                var value = attr[p];

                if(value.set) 
                    obj.__defineSetter__(p, value.set);
                if(value.get) 
                    obj.__defineGetter__(p, value.get);
            }
        }
    }

    cl.defineGetterSetter(cc.Node.prototype, "name", "getName", "setName");

    cl.config = {};

    cl.readConfig = function() {
        cl.config = {};

        var path = cc.path.join(cc.loader.resPath, 'project.json');

        cc.loader.loadJson(path, function(err, json){
            if(err) throw err;

            cl.config['physics'] = json['physics'] ? json['physics'] : 'None';
        });
    }

});


