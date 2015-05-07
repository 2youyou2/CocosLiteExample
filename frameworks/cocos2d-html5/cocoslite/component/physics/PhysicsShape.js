(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var PhysicsShape = Component.extendComponent("PhysicsShape", {
        properties: ['sensor', 'elasticity', 'friction'],

        ctor: function() {
            this._super(['PhysicsBody']);

            this._shapes     = [];
            this._sensor     = false;
            this._elasticity = 0;
            this._friction   = 0;
        },

        getBody: function() {
            return this._physicsBody.getBody();
        },

        getShapes: function() {
            return this._shapes;
        },

        createShape: function() {
            return null;
        },

        updateShape: function() {
            if(!this._physicsBody) {
                return;
            }

            this._shapes.forEach(function(shape) {
                cl.space.removeShape(shape);
            });

            this._shapes = this.createShape();
            if(!Array.isArray(this._shapes)) {
                this._shapes = [this._shapes];
            }
            
            this._shapes.forEach(function(shape) {
                cl.space.addShape(shape);
            });
        },

        onEnter: function(target) {
            this._physicsBody = this.getComponent('PhysicsBody');

            this.updateShape();
        },

        _get_set_: {
            sensor: {
                get: function() {
                    return this._sensor;
                },
                set: function(val) {
                    this._sensor = val;

                    this._shapes.forEach(function(shape) {
                        shape.setSensor(val);
                    });
                }
            },

            elasticity: {
                get: function() {
                    return this._elasticity;
                },
                set: function(val) {
                    this._elasticity = val;

                    this._shapes.forEach(function(shape) {
                        shape.setElasticity(val);
                    });
                }
            },

            friction: {
                get: function() {
                    return this._friction;
                },
                set: function(val) {
                    this._friction = val;

                    this._shapes.forEach(function(shape) {
                        shape.setFriction(val);
                    });
                }
            }
        },

        _show_: function() {
            return cl.config.physics === 'chipmunk';
        },

        _folder_: "physics",
        _abstract_: true
    });

    module.exports = PhysicsShape;
});
