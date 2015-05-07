(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component    = require("../Component.js");
    var PhysicsShape = require("./PhysicsShape.js");


    var PhysicsBox = Component.extendComponent("PhysicsBox", {
        properties: PhysicsShape.prototype.properties.concat(['width', 'height', 'anchor']),
        
        ctor: function() {

            this.width  = 50;
            this.height = 50;
            this._anchor = cl.p(0.5, 0.5);
            
            this._super();
        },

        createVerts: function() {
            var t = this.getComponent('TransformComponent');

            var ax = this.anchor.x, ay = this.anchor.y;
            var w  = this.width,    h  = this.height;
            var sx = t.scaleX,      sy = t.scaleY;

            var hw = this.width  * this.anchor.x * t.scaleX;
            var hh = this.height * this.anchor.y * t.scaleY;

            var l = -w * sx * ax;
            var r =  w * sx * (1-ax);
            var b = -h * sy * ay;
            var t =  h * sy * (1-ay);

            var verts = [
                l, b,
                l, t,
                r, t,
                r, b
            ];

            return verts;
        },

        createShape: function() {
            return new cp.PolyShape(this.getBody(), this.createVerts(), cp.vzero);
        },

        _get_set_: {
            anchor: {
                get: function() {
                    return this._anchor;
                },
                set: function(val) {
                    this._anchor = cl.p(val);
                }
            }
        }
    }, PhysicsShape);

    module.exports = PhysicsBox;
});
