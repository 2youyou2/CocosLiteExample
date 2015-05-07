(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component    = require("../Component.js");

    var Spine = Component.extendComponent("Spine", {
        properties: ["file", "animation"],

        ctor: function() {
            this._super();

            this._file      = ""; 
            this._animation = "";
            this._spine     = null;
        },
       
        onBind: function(target) {
            if(this._spine) {
                target.addChild(this._spine);
            }
        },

        setMix: function() {
            if(this._spine) {
                this._spine.setMix.apply(this._spine, arguments);
            }
        },

        _updateSpine: function() {
            if(this._spine) {
                this._spine.removeFromParent();
            }

            var json  = this._file;
            var atlas = this._file.replace('.json', '') + '.atlas';

            this._spine = new sp.SkeletonAnimation(json, atlas);

            if(this._spine) {
                this.target.addChild(this._spine);
                this._updateAnimation();
            }
        },

        _updateAnimation: function() {
            if(!this._spine) {
                return;
            }

            if(this._animation) {
                this._spine.setAnimation(0, this._animation, true);
            }
        },

        _get_set_: {
            file: {
                get: function() {
                    return this._file;
                },
                set: function(val) {
                    if(this._file === val) {
                        return;
                    }

                    this._file = val;
                    this._updateSpine();
                }
            },

            animation: {
                get: function() {
                    return this._animation;
                },
                set: function(val) {
                    if(this._animation === val) {
                        return;
                    }

                    this._animation = val;
                    this._updateAnimation();
                }
            }
        },

        _folder_: "animation"
    });

    module.exports = Spine;
});
