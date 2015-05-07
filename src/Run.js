/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global cl, cc*/

(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Component  = cl.getModule("component/Component");
    var KeyManager = cl.getModule("utils/KeyManager");

    var Params = function() {

        this.properties = ["maxSpeed", "acceleration", "drag", "jumpSpeed"];

        this.maxSpeed     = 500;
        this.acceleration = 1500;
        this.drag         = 600;
        this.jumpSpeed    = 200;

        this.jumping      = false;

        this.ctor = function() {
            this._super(['PhysicsBody']);
        }

        this.onEnter = function() {
            this.t = this.getComponent("TransformComponent");
            this.p = this.getComponent("PhysicsBody");
            this.s = this.getComponent("Spine");

            this.s.setMix('walk', 'idle', 0.2);
            this.s.setMix('idle', 'walk', 0.2);
        };

        this.onUpdate = function(dt) {
            this.speed = this.p.getVel();

            if(KeyManager.isKeyDown(cc.KEY.left)) {
                this.s.animation = 'walk';

                if(this.target.scaleX > 0) {
                    this.target.scaleX *= -1;
                }

                this.speed.x -= this.acceleration * dt;
                if(this.speed.x < -this.maxSpeed) {
                    this.speed.x = -this.maxSpeed;
                }
            } 
            else if (KeyManager.isKeyDown(cc.KEY.right)) {
                this.s.animation = 'walk';

                if(this.target.scaleX < 0) {
                    this.target.scaleX *= -1;
                }

                this.speed.x += this.acceleration * dt;
                if(this.speed.x > this.maxSpeed) {
                    this.speed.x = this.maxSpeed;
                }
            }  
            else {
                if(this.speed.x != 0) {
                    var d = this.drag*dt;
                    if(Math.abs(this.speed.x) <= d) {
                        this.speed.x = 0;
                        this.s.animation = 'idle';
                    } else {
                        this.speed.x -= this.speed.x > 0 ? d : -d;
                    }
                }
            }

            if(Math.abs(this.speed.y) < 1) {
                this.jumps   = 2;
                this.jumping = false;
            }

            if (this.jumps > 0 && KeyManager.isKeyDown(cc.KEY.up, 0.15)) {
                this.speed.y = this.jumpSpeed;
                this.jumping = true;
            }

            if (this.jumping && KeyManager.isKeyRelease(cc.KEY.up)) {
                this.jumps--;
                this.jumping = false;
            }

            this.p.setVel(this.speed);
        };

        this._folder_ = "Script";
    }

    var Run = Component.extendComponent("Run", new Params);

    
    exports.Constructor = Run;
    exports.Params = Params;
    
});