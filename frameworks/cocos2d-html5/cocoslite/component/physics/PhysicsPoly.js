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
    var Separator  = require("./Separator.js");




    var PhysicsPoly = Component.extendComponent("PhysicsPoly", {
        serialization: ['verts'],

        ctor: function() {
            this._verts = [cl.p(-25, -25), cl.p( -25, 25), cl.p(25, 25), cl.p(25, -25)];
            this._super();
        },

        createShape: function() {
            var verts = [];
            var i, j;
            var poly;

            var shapes = [];

            var ret = Separator.validate(verts);
            if(ret === 0) {

                var body   = this.getBody();

                var scaleX = this.target.scaleX;
                var scaleY = this.target.scaleY;

                // reverse verts
                var temp   = this._verts.reverse();
                var polys  = Separator.calcShapes(temp);

                for(i=0; i<polys.length; i++) {
                    
                    poly  = polys[i].reverse();
                    verts = [];

                    for(j=0; j<poly.length; j++) {
                        verts.push( poly[j].x * scaleX );
                        verts.push( poly[j].y * scaleY );
                    }

                    shapes.push(new cp.PolyShape(body, verts, cp.vzero));
                }

            } else {
                console.log("Failed to create convex polygon : ", ret);
            }

            return shapes;
        },

        _get_set_: {
            verts: {
                get: function() {
                    return this._verts;
                },
                set: function(verts) {
                    this._verts.splice(0, this._verts.length);

                    for(var i=0; i<verts.length; i++){
                        this._verts.push(cl.p(verts[i]));
                    }
                }
            }
        }
    }, PhysicsShape);

    module.exports = PhysicsPoly;
});
