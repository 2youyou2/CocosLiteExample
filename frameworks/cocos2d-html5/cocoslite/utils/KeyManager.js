(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Time = require('./Time.js');

    var KeyManager = function(element) {

        var _map = {};

        this.isKeyDown = function(key, duration) {
            var state = _map[key];
            if(!state) {
                return false;
            }

            if(duration !== undefined) {
                return (Time.now - state.time) <= duration;
            } else {
                return state.pressed;
            }
        };

        this.isKeyRelease = function(key) {
            var state = _map[key];
            return !state || !state.pressed;
        };
        
        this.matchKeyDown = function(keys) {
            keys = keys.length ? keys : [keys];

            if(Object.keys(_map).length !== keys.length) {
                return false;
            }

            var match = true;

            for(var i in keys) {
                if(!_map[keys[i]]) {
                    match = false;
                    break;
                }
            }

            return match;
        };

        this.onKeyPressed = function(key) {
            var state = _map[key];
            if(state && state.pressed) {
                return;
            }

            _map[key] = {
                pressed: true,
                time: Time.now
            };
        }

        this.onKeyReleased = function(key) {
            _map[key] = {
                pressed: false,
            };
        }

        // for web application
        if(element) {
            var self = this;

            element.addEventListener('keydown', function(e) {
                self.onKeyPressed(e.which);
            });

            element.addEventListener('keyup', function(e) {
                self.onKeyReleased(e.which);
            });
        }
    }
    
    cl.keyManager = new KeyManager;
    cl.KeyManager = KeyManager;

    cc.eventManager.addListener(cc.EventListener.create({

        event: cc.EventListener.KEYBOARD,

        onKeyPressed : cl.keyManager.onKeyPressed,
        onKeyReleased: cl.keyManager.onKeyReleased

    }), 10000);

    module.exports = cl.keyManager;
});
