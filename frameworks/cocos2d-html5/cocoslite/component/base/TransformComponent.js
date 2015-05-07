(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var TransformComponent = Component.extendComponent("TransformComponent", {
        properties: ["position", "scale", "rotation"],
        
        ctor: function() {
            this._super();
        },

        _get_set_: {
            "position": {
                get: function() {
                    if(!this.target) {
                        return cl.p();
                    }
                    return this.target.getPosition();
                },
                set: function(val) {
                    this.target.setPosition(val);
                }
            },

            "scale": {
                get: function() {
                    if(!this.target) {
                        return cl.p();
                    }
                    return cl.p(this.target.scaleX, this.target.scaleY);
                },
                set: function(val, y) {
                    if(y) {
                        this.target.scaleX = val;
                        this.target.scaleY = y;
                    } else {
                        this.target.scaleX = val.x;
                        this.target.scaleY = val.y;
                    }  
                }
            },

            "rotation": {
                get: function() {
                    if(!this.target) {
                        return cl.p();
                    }
                    return cl.p(this.target.rotationX, this.target.rotationY);
                },
                set: function(val, y) {
                    if(y) {
                        this.target.rotationX = val;
                        this.target.rotationY = y;
                    } else if(val.x !== undefined) {
                        this.target.rotationX = val.x;
                        this.target.rotationY = val.y;
                    } else {
                        this.target.rotation = val;
                    }
                }
            },

            "x": {
                set: function(val) {
                    this.position = cl.p(val, this.position.y);
                },
                get: function() {
                    return this.target.x;
                }
            },

            "y": {
                set: function(val) {
                    this.position = cl.p(this.position.x, val);
                },
                get: function() {
                    return this.target.y;
                }
            },

            "scaleX": {
                set: function(val) {
                    this.scale = cl.p(val, this.scale.y);
                },
                get: function() {
                    return this.target.scaleX;
                }
            },

            "scaleY": {
                set: function(val) {
                    this.scale = cl.p(this.scale.x, val);
                },
                get: function() {
                    return this.target.scaleY;
                }
            },

            "rotationX": {
                set: function(val) {
                    this.rotation = cl.p(val, this.rotation.y);
                    this.target.rotationX = val;
                },
                get: function() {
                    return this.target.rotationX;
                }
            },

            "rotationY": {
                set: function(val) {
                    this.rotation = cl.p(this.rotation.x, val);
                },
                get: function() {
                    return this.target.rotationY;
                }
            }
        },

        _folder_: "base"
    });

    module.exports = TransformComponent;
});
