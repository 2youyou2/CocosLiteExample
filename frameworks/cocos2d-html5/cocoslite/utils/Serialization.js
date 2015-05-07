(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Component  = require("../component/Component.js");
    var GameObject = require("../core/GameObject.js");

    var _deserializeFuncs = [];

    // serialize function

    cc.Sprite.prototype.toJSON  = function() {
        var texture = this.getTexture();
        return texture ? texture.url : "";
    };

    cc.Color.prototype.toJSON = function() {
        return cc.colorToHex(this);
    }

    cc.Scene.prototype.toJSON = function() {
        var json          = {};
        json.root         = {};
        json.root.res     = this.res;
        json.root.physics = this.physics;

        var childrenJson  = json.root.children = [];
        var children      = this.children;

        if(this.canvas) {
            children                = this.canvas.children;
            json.root.canvas        = {};
            json.root.canvas.offset = this.canvas.offset;
            json.root.canvas.scale  = this.canvas.scale;    
        }

        for(var k=0; k<children.length; k++) {
            var child = children[k];

            if(child.constructor === cl.GameObject) {
                var cj = child.toJSON();
                childrenJson.push(cj);
            }
        }

        return json;
    };

    cl.Point.prototype.toJSON = function() {
        return {
            x : this.x.toFixed(3),
            y : this.y.toFixed(3)
        }
    };

    GameObject.prototype.toJSON = function(){
        var json = {};

        var components = json.components = [];

        var cs = this.components;
        for(var i=0; i<cs.length; i++) {
            components.push(cs[i].toJSON());
        }

        for(var k=0; k<this.children.length; k++){
            var child = this.children[k];
            if(child.constructor === cl.GameObject){
                
                if(!json.children) {
                    json.children = [];
                }

                var cj = child.toJSON();
                json.children.push(cj);
            }
        }

        var self = this;
        this.properties.forEach(function(p) {
            json[p] = self[p];
        });

        return json;
    };

    Component.prototype.toJSON = function() {
        var json = {};
        json.class = this.className;

        var serialization = this.properties;
        if(this.serialization) {
            serialization = this.serialization.concat(this.properties);
        }

        for(var i=0; i<serialization.length; i++) {
            var k = serialization[i];

            var value = this[k];

            if(this["toJSON"+k]) {
                json[k] = this["toJSON"+k]();
            }
            else if(typeof value === 'number') {
                json[k] = value.toFixed(3);
            }
            else if(value !== null && value !== undefined){
                json[k] = value.toJSON ? value.toJSON() : value;
            }
        }
        return json;
    };


    // deserialize function

    var registerDeserialize = function(func) {
        _deserializeFuncs.push(func);
    };

    var tryReviver = function(key, value) {
        for(var i=0; i<_deserializeFuncs.length; i++) {
            try {
                var ret = _deserializeFuncs[i](key, value);

                if(ret) {
                    return ret;
                }
            }
            catch(e) {
                console.log("Component.tryReviver for [%s]failed : ", key, e);
            }
        }

        return value;
    }


    var stringParsers = [
        {
            re: /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
            parse: function(execResult) {
                return cc.color(execResult[0]);
            }
        },
        {
            re: /cl.Enum.(\w*)+\.(\w*)+/,
            parse: function(execResult) {
                return cl.Enum[execResult[1]][execResult[2]];
            }
        }
    ];

    // register default deserialize
    registerDeserialize(function(key, value) {

        var ret = null;

        if(typeof value === 'string') {

            stringParsers.forEach(function(parser) {
                var match = parser.re.exec(value);

                if(match) {
                    ret = parser.parse(match);
                }
            });
        }

        return ret;
    });


    Component.fromJSON = function(object, json) {
        var c = object.addComponent(json.class);
        if(c == null) return null;
        
        for(var k in json) {
            if(k == "class") continue;
            
            var value = json[k];

            var ret = tryReviver(k, value);
            if(ret) {
                value = ret;
            }

            c[k] = value;
        }

        return c;
    };

    GameObject.fromJSON = function(json) {
        var o = new GameObject();

        o.properties.forEach(function(p) {
            o[p] = json[p] === undefined ? o[p] : json[p];
        });

        for(var i=0; i<json.components.length; i++) {
            Component.fromJSON(o, json.components[i]);
        }

        if(json.children) {
            for(var i=0; i<json.children.length; i++){
                GameObject.fromJSON(o, json.children[i]);
            }
        }

        return o;
    };

    exports.registerDeserialize = registerDeserialize;
    exports.tryReviver          = tryReviver;

    cl.Serialization = exports;
});