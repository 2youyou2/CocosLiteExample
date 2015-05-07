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


    var PhysicsSegment = Component.extendComponent("PhysicsSegment", {
        properties: PhysicsShape.prototype.properties.concat(['start', 'end']),

        ctor: function() {
            this._super();

            this._start = cl.p(0,  0);
            this._end   = cl.p(100,0);
        },

        createShape: function() {
            return new cp.SegmentShape(this.getBody(), this._start, this._end, 0);
        },

        _get_set_: {
            start: {
                get: function() {
                    return this._start;
                },
                set: function(val) {
                    this._start = cl.p(val);
                }
            },

            end: {
                get: function() {
                    return this._end;
                },
                set: function(val) {
                    this._end = cl.p(val);
                }
            }
        }
    }, PhysicsShape);

    module.exports = PhysicsSegment;
});
