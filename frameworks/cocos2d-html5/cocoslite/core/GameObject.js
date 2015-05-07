(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Component = require("../component/Component.js");

    var GameObject = cc.Node.extend({
        properties: ["name", "tag"],

        ctor : function (){
            this._super();

            this._components = [];
            this._properties = [];
            this._updateRequest = 0;

            this.name = "GameObject";

            this.addComponent("TransformComponent");
            
        },

        _getComponents: function(){
            return this._components;
        },

        addComponent : function(className){
            var c;

            if(typeof className === 'string') {
                c = this._components[className];
                if(c) return c;

                c = cl.ComponentManager.create(className);
                if(c == null){
                    console.log(className + "is not a valid Component");
                    return null;
                }

                this._components[className] = c;
            } else if(typeof className === 'object'){
                c = className;
                this._components[c.className] = c;
            }


            c._bind(this);
            this._components.push(c);

            if(c.onUpdate) {
                if(this._updateRequest === 0 && this.isRunning()) {
                    this.scheduleUpdate();
                }
                this._updateRequest++;
            }

            if(this.isRunning()) {
                c._enter(this);
            }

            return c;
        },

        addComponents : function(classnames){
            for(var key in classnames){
                this.addCompoent(classnames[key]);
            }
        },

        getComponent: function(className){
            return this._components[className];
        },

        removeComponent: function (className) {
            if(typeof className === 'object') {
                className = className.className;
            }

            var c = this._components[className];

            if(c != null) {
                c._unbind();

                if(c.onUpdate) {
                    this._updateRequest--;
                    if(this._updateRequest === 0) {
                        this.unscheduleUpdate();
                    }
                }


                delete this._components[className];
                var index = this._components.indexOf(c);
                this._components.splice(index, 1);
            }

            return c;
        },

        onEnter: function() {
            cc.Node.prototype.onEnter.call(this);

            for(var i=0; i<this._components.length; i++){
                this._components[i]._enter(this);
            }

            if(this._updateRequest > 0) {
                this.scheduleUpdate();
            }
        },

        update: function(dt) {
            if(!this.isRunning()) return;

            for(var key in this._components){
                var c = this._components[key];
                if(c.onUpdate) {
                    c.onUpdate(dt);
                }
            }
        },

        hitTest: function(worldPoint){
            for(var key in this._components){
                var c = this._components[key];
                if(c.hitTest != null && c.hitTest(worldPoint))
                    return true;
            }

            return false;
        },

        clone: function() {
            var json = this.toJSON();
            return GameObject.fromJSON(json);
        }
    });

    cl.defineGetterSetter(GameObject.prototype, "components", "_getComponents");

    module.exports = cl.GameObject = GameObject;
});
