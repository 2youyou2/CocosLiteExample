(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component       = require("../Component.js");

    var PhysicsBody = Component.extendComponent("PhysicsBody", {
        properties: ['static', 'mess', 'moment'],

        ctor: function() {
            this._static = false;
            this._mess = 1;
            this._moment = 1000;
            this._duringUpdate = false;

            this._super();
        },

        getBody: function() {
            return this._body;
        },

        onEnter: function(target) {
            if(this._static) {
                this._body = cl.space.staticBody;
            } else {
                this._body = new cp.Body(this._mess, this._moment );
                cl.space.addBody( this._body );
            }

            this.setVel = this._body.setVel.bind(this._body);
            this.getVel = this._body.getVel.bind(this._body);

            var self = this;

            this.t = this.getComponent("TransformComponent");

            target._originSetPosition = target.setPosition;
            target.setPosition = function(x, y) {
                this._originSetPosition.apply(this, arguments);

                if(self._duringUpdate || !self._body) {
                    return;
                }

                if (y === undefined) {
                    self._body.setPos(x);
                } else {
                    self._body.setPos(cl.p(x, y));
                }
            }

            target._originSetRotation = target.setRotation;
            target.setRotation = function(r) {
                this._originSetRotation.apply(this, arguments);

                if(self._duringUpdate || !self._body) {
                    return;
                }

                self._body.a = -cc.degreesToRadians(r);
            }

            cl.defineGetterSetter(target, "position", target.getPosition, target.setPosition);
            cl.defineGetterSetter(target, "rotation", target.getRotation, target.setRotation);

            target.position = target.position;
            target.rotation = target.rotation;
        },

        _syncPosition:function () {
            var p = this._body.getPos();
            var locPosition = this.t.position;

            if (locPosition.x !== p.x || locPosition.y !== p.y) {
                this.t.position = cl.p(p);
            }
        },
        _syncRotation:function () {
            var a = -cc.radiansToDegrees(this._body.getAngle());
            if (this.t.rotationX !== a) {
                this.t.rotation = a;
            }
        },

        onUpdate: function(dt) {
            if(this._static) {
                return;
            }

            this._duringUpdate = true;

            this._syncPosition();
            this._syncRotation();

            this._duringUpdate = false;
        },

        _get_set_: {
            'static': {
                get: function() {
                    return this._static;
                },

                set: function(val) {
                    this._static = val;
                }
            },

            'mess': {
                get: function() {
                    return this._mess;
                },

                set: function(val) {
                    this._mess = val ? val : Infinity;

                    if(this._body && this._static) {
                        this._body.setMess(val);
                    }
                }
            },

            'moment': {
                get: function() {
                    return this._moment;
                },

                set: function(val) {
                    this._moment = val ? val : Infinity;

                    if(this._body && this._static) {
                        this._body.setMoment(val);
                    }
                }
            }
        },

        _show_: function() {
            return cl.config.physics === 'chipmunk';
        },
        _folder_: "physics"
    });

    module.exports = PhysicsBody;
});
