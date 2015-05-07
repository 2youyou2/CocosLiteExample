(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = require("./ComponentManager.js");

    var ctor = function(dependencies) {
        var self = this;

        var _dependencies    = dependencies ? dependencies : [];
        var _target          = null;
        var _exportedMethods = null;
        var _entered         = false;

        this.addComponent = function(className){
            if(_target)
                return _target.addComponent(className);
            return null;
        };

        this.getComponent = function(className){
            if(_target)
                return _target.getComponent(className);
            return null;
        },

        this._bind = function(target){
            _target = target;

            for(var k in _dependencies){
                this.addComponent(_dependencies[k]);
            }

            this.onBind(target);
        };

        this._unbind = function(){
            if(_exportedMethods != null){
                var methods = _exportedMethods;

                for(var key in methods){
                    var method = methods[key];
                    _target[method] = null;
                }
            }

            this.onUnbind(_target);
        };

        this._enter = function() {
            if(_entered) {
                return;
            }

            _entered = true;
            this.onEnter(_target);
        };

        this._exportMethods = function (methods) {

            _exportedMethods = methods;

            for(var key in methods){
                var method = methods[key];
                _target[method] = function(){
                    self[method].apply(self, arguments);
                };
            }
        };

        cl.defineGetterSetter(this, {
            "target": {
                get: function() {
                    return _target;
                }
            }
        });
    }

    var Component = cc.Class.extend({
        properties: [],
        
        ctor:ctor,
        
        onBind: function(target) {

        },
        onUnbind: function(target) {

        },
        onEnter: function(target) {

        }
    });



    Component.extendComponent = function(className, params, parent) {
        if(!parent) parent = Component;

        var gs = params._get_set_;
        delete params._get_set_;

        var _folder_ = params._folder_ ? params._folder_ : parent._folder_;
        delete params._folder_;

        var abstract = params._abstract_;
        delete params._abstract_;

        var _show_ = params._show_ ? params._show_ : parent._show_;
        delete params._show_;

        var ret = parent.extend(params);

        if(gs) {
            cl.defineGetterSetter(ret.prototype, gs);
        }

        ret.prototype.className = ret.className = className;
        ret._folder_ = _folder_;
        ret._show_ = _show_;

        if(!abstract) {
            ComponentManager.register(className, ret);
        }

        return ret;
    }

    Component.init = function(obj, params) {
        for(var k in params) {
            obj[k] = params[k];
        }
    }

    module.exports = cl.Component = Component;
});
