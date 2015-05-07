(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = cc.Class.extend({
        ctor : function () {
            this._classes = [];
        },

        register : function(className, cls){
            this._classes[className] = cls;
        },

        unregister : function(className){
            delete this._classes[className];
        },

        create : function (className) {
            var cls = this._classes[className];

            if(cls != null)
                return new cls(arguments);

            return null;
        },

        getAllClasses: function(){
            return this._classes;
        },

        clear: function() {
            this._classes = [];
        }
    });

    module.exports = cl.ComponentManager = new ComponentManager;
});
