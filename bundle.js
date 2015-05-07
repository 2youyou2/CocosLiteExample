(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/cocoslite.js":[function(require,module,exports){
cl = cl ? cl : {};


(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    cl.defineGetterSetter = function(obj, attr, getter, setter){
        if(typeof attr === 'string') {

            // define getter
            if(typeof getter == 'function')
                obj.__defineGetter__(attr, getter);
            else if(typeof getter == 'string')
                obj.__defineGetter__(attr, obj[getter]);
            
            // define setter
            if(typeof setter == 'function')
                obj.__defineSetter__(attr, setter);
            else if(typeof setter == 'string')  
                obj.__defineSetter__(attr, obj[setter]);

        } else if(typeof attr === 'object') {
            for(var p in attr) {
                var value = attr[p];

                if(value.set) 
                    obj.__defineSetter__(p, value.set);
                if(value.get) 
                    obj.__defineGetter__(p, value.get);
            }
        }
    }

    cl.defineGetterSetter(cc.Node.prototype, "name", "getName", "setName");

    cl.config = {};

    cl.readConfig = function() {
        cl.config = {};

        var path = cc.path.join(cc.loader.resPath, 'project.json');

        cc.loader.loadJson(path, function(err, json){
            if(err) throw err;

            cl.config['physics'] = json['physics'] ? json['physics'] : 'None';
        });
    }

});



},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = require("./ComponentManager.js");

    var ctor = function(dependencies) {
        var self = this;

        var _dependencies    = dependencies ? dependencies : [];
        var _target          = null;
        var _exportedMethods = null;
        var _entered         = false;

        this.addComponent = function(className){
            if(_target)
                return _target.addComponent(className);
            return null;
        };

        this.getComponent = function(className){
            if(_target)
                return _target.getComponent(className);
            return null;
        },

        this._bind = function(target){
            _target = target;

            for(var k in _dependencies){
                this.addComponent(_dependencies[k]);
            }

            this.onBind(target);
        };

        this._unbind = function(){
            if(_exportedMethods != null){
                var methods = _exportedMethods;

                for(var key in methods){
                    var method = methods[key];
                    _target[method] = null;
                }
            }

            this.onUnbind(_target);
        };

        this._enter = function() {
            if(_entered) {
                return;
            }

            _entered = true;
            this.onEnter(_target);
        };

        this._exportMethods = function (methods) {

            _exportedMethods = methods;

            for(var key in methods){
                var method = methods[key];
                _target[method] = function(){
                    self[method].apply(self, arguments);
                };
            }
        };

        cl.defineGetterSetter(this, {
            "target": {
                get: function() {
                    return _target;
                }
            }
        });
    }

    var Component = cc.Class.extend({
        properties: [],
        
        ctor:ctor,
        
        onBind: function(target) {

        },
        onUnbind: function(target) {

        },
        onEnter: function(target) {

        }
    });



    Component.extendComponent = function(className, params, parent) {
        if(!parent) parent = Component;

        var gs = params._get_set_;
        delete params._get_set_;

        var _folder_ = params._folder_ ? params._folder_ : parent._folder_;
        delete params._folder_;

        var abstract = params._abstract_;
        delete params._abstract_;

        var _show_ = params._show_ ? params._show_ : parent._show_;
        delete params._show_;

        var ret = parent.extend(params);

        if(gs) {
            cl.defineGetterSetter(ret.prototype, gs);
        }

        ret.prototype.className = ret.className = className;
        ret._folder_ = _folder_;
        ret._show_ = _show_;

        if(!abstract) {
            ComponentManager.register(className, ret);
        }

        return ret;
    }

    Component.init = function(obj, params) {
        for(var k in params) {
            obj[k] = params[k];
        }
    }

    module.exports = cl.Component = Component;
});

},{"./ComponentManager.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/ComponentManager.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/ComponentManager.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var ComponentManager = cc.Class.extend({
        ctor : function () {
            this._classes = [];
        },

        register : function(className, cls){
            this._classes[className] = cls;
        },

        unregister : function(className){
            delete this._classes[className];
        },

        create : function (className) {
            var cls = this._classes[className];

            if(cls != null)
                return new cls(arguments);

            return null;
        },

        getAllClasses: function(){
            return this._classes;
        },

        clear: function() {
            this._classes = [];
        }
    });

    module.exports = cl.ComponentManager = new ComponentManager;
});

},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/animation/Spine.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/ColorComponent.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var ColorComponent = Component.extendComponent("ColorComponent", {
        properties: ["color", "cascadeColor", "opacity", "cascadeOpacity"],

        ctor: function() {
            this._super();
        },

        _get_set_: {
            "color": {
                get: function() {
                    if(!this.target) {
                        return cc.color();
                    }
                    return this.target.color;
                },
                set: function(val) {
                    this.target.color = val;
                }
            },

            "cascadeColor": {
                get: function() {
                    if(!this.target) {
                        return false;
                    }
                    return this.target.cascadeColor;
                },
                set: function(val) {
                    this.target.cascadeColor = val;
                }
            },

            "opacity": {
                get: function() {
                    if(!this.target) {
                        return 0;
                    }
                    return this.target.opacity;
                },
                set: function(val) {
                    this.target.opacity = val;
                }
            },

            "cascadeOpacity": {
                set: function(val) {
                    this.target.cascadeOpacity = val;
                },
                get: function() {
                    if(!this.target) {
                        return false;
                    }
                    return this.target.cascadeOpacity;
                }
            }
        },

        _folder_: "base"
    });

    module.exports = ColorComponent;
});

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/MeshComponent.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var MeshComponent = Component.extendComponent("MeshComponent", {
        // properties: ["materials"],
        // serialization: ["subMeshes", "vertices"],

        ctor: function () {
            
            this._innerMesh = new cl.MeshSprite();
            this._innerMesh.retain();
            
            this._super();
        },

        _getMaterials: function() {
            return this._innerMesh.materials;
        },
        _setMaterials: function(materials) {
            this._innerMesh.materials = materials;
        },

        setSubMesh: function(index, indices) {
            this._innerMesh.setSubMesh(index, indices);
        },
        _getSubMeshes: function(index) {
            return this._innerMesh.subMeshes;
        },

        _setVertices: function(vertices) {
            this._innerMesh.vertices = vertices;
        },
        _getVertices: function() {
            return this._innerMesh.vertices;
        },

        rebindVertices: function() {
            return this._innerMesh.rebindVertices();
        },

        hitTest: function(worldPoint) {
            if(!this._innerMesh || !worldPoint) return;

            var p = this._innerMesh.convertToNodeSpace(worldPoint);
            p = cc.p(p);

            var vertices = this.vertices;
            var subMeshes = this.subMeshes;

            for(var i=0; i<subMeshes.length; i++){
                var indices = subMeshes[i];
                for(var j=0; j<indices.length; j+=3){
                    var a = cc.p(vertices[indices[j  ]].vertices);
                    var b = cc.p(vertices[indices[j+1]].vertices);
                    var c = cc.p(vertices[indices[j+2]].vertices);

                    if(a.equal(b) && b.equal(c))
                        continue;

                    if(p.inTriangle(a,b,c))
                        return true;
                }
            }

            return false;
        },

        onBind: function(target) {
            target.addChild(this._innerMesh);
        },

        _folder_: "base"
    });

    var _p = MeshComponent.prototype;
    MeshComponent.editorDir = "Mesh";

    cl.defineGetterSetter(_p, "materials", "_getMaterials", "_setMaterials");
    cl.defineGetterSetter(_p, "vertices", "_getVertices", "_setVertices");
    cl.defineGetterSetter(_p, "subMeshes", "_getSubMeshes");

    module.exports = MeshComponent;
});


},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/SpriteComponent.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";
    
    var Component = require("../Component.js");

    var SpriteComponent = Component.extendComponent("SpriteComponent", {
        properties: ["sprite", "anchorPoint"],
        
        ctor: function () {
            
            this._anchorPoint = new cl.p(0.5, 0.5);
            this._innerSprite = new cc.Sprite();
            
            this._super();
        },

        _setSprite: function(file) {
            if(file !== "") {
                this._innerSprite.initWithFile(file);
            } else {
                this._innerSprite.setTexture(null);
            }
        },
        _getSprite: function(){
            return this._innerSprite;
        },

        _getAnchorPoint: function(){
            return this._anchorPoint;
        },
        _setAnchorPoint: function(val){
            this._anchorPoint = cl.p(val);
            this._innerSprite.setAnchorPoint(val);
        },

        _getBoundingBox: function(){
            return this._innerSprite.getBoundingBoxToWorld();
        },

        onBind: function(target) {
            target.addChild(this._innerSprite);
        },
        onUnbind: function(target){
            target.removeChild(this._innerSprite);
        },

        hitTest: function(worldPoint){
            if(!this._innerSprite || !worldPoint) return;

            var p = this._innerSprite.convertToNodeSpace(worldPoint);
            var s = this._innerSprite.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);

            return cc.rectContainsPoint(rect, p);
        },

        _folder_: "base"
    });

    var _p = SpriteComponent.prototype;
    SpriteComponent.editorDir = "Sprite";

    cl.defineGetterSetter(_p, "sprite", "_getSprite", "_setSprite");
    cl.defineGetterSetter(_p, "anchorPoint", "_getAnchorPoint", "_setAnchorPoint");
    cl.defineGetterSetter(_p, "boundingBox", "_getBoundingBox", null);

    module.exports = SpriteComponent;
});

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/TransformComponent.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsBody.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsBox.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","./PhysicsShape.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsShape.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsPoly.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","./PhysicsShape.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsShape.js","./Separator.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/Separator.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsSegment.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","./PhysicsShape.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsShape.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsShape.js":[function(require,module,exports){
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

},{"../Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/Separator.js":[function(require,module,exports){
(function(factory) {
    if (typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if (typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    function b2Vec2(x, y) {
        return {
            x: x,
            y: y
        };
    }

    /**
   * Checks whether the vertices in <code>verticesArray</code> can be properly distributed into the new fixtures (more specifically, it makes sure there are no overlapping segments and the vertices are in clockwise order). 
   * It is recommended that you use this method for debugging only, because it may cost more CPU usage.
   * <p/>
   * @param verticesArray The vertices to be validated.
   * @return An integer which can have the following values:
   * <ul>
   * <li>0 if the vertices can be properly processed.</li>
   * <li>1 If there are overlapping lines.</li>
   * <li>2 if the points are <b>not</b> in clockwise order.</li>
   * <li>3 if there are overlapping lines <b>and</b> the points are <b>not</b> in clockwise order.</li>
   * </ul> 
   * */
    var validate = function(verticesArray) {
        var i, n = verticesArray.length,
        j, j2, i2, i3, d, ret = 0;
        var fl, fl2 = false;

        for (i = 0; i < n; i++) {
            i2 = (i < n - 1) ? i + 1 : 0;
            i3 = (i > 0) ? i - 1 : n - 1;

            fl = false;
            for (j = 0; j < n; j++) {
                if (((j != i) && j != i2)) {
                    if (!fl) {
                        d = det(verticesArray[i].x, verticesArray[i].y, verticesArray[i2].x, verticesArray[i2].y, verticesArray[j].x, verticesArray[j].y);
                        if ((d > 0)) {
                            fl = true;
                        }
                    }

                    if ((j != i3)) {
                        j2 = (j < n - 1) ? j + 1 : 0;
                        if (hitSegment(verticesArray[i].x, verticesArray[i].y, verticesArray[i2].x, verticesArray[i2].y, verticesArray[j].x, verticesArray[j].y, verticesArray[j2].x, verticesArray[j2].y)) {
                            ret = 1;
                        }
                    }
                }
            }

            if (!fl) {
                fl2 = true;
            }
        }

        if (fl2) {
            if ((ret == 1)) {
                ret = 3;
            } else {
                ret = 2;
            }

        }
        return ret;
    }

    function calcShapes(verticesArray) {
        var vec;
        var i, n, j;
        var d, t, dx, dy, minLen;
        var i1, i2, i3, p1, p2, p3;
        var j1, j2, v1, v2, k, h;
        var vec1, vec2;
        var v, hitV;
        var isConvex;
        var figsVec = [],
        queue = [];

        queue.push(verticesArray);

        while (queue.length) {
            vec = queue[0];
            n = vec.length;
            isConvex = true;

            for (i = 0; i < n; i++) {
                i1 = i;
                i2 = (i < n - 1) ? i + 1 : i + 1 - n;
                i3 = (i < n - 2) ? i + 2 : i + 2 - n;

                p1 = vec[i1];
                p2 = vec[i2];
                p3 = vec[i3];

                d = det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                if ((d < 0)) {
                    isConvex = false;
                    minLen = Number.MAX_VALUE;

                    for (j = 0; j < n; j++) {
                        if (((j != i1) && j != i2)) {
                            j1 = j;
                            j2 = (j < n - 1) ? j + 1 : 0;

                            v1 = vec[j1];
                            v2 = vec[j2];

                            v = hitRay(p1.x, p1.y, p2.x, p2.y, v1.x, v1.y, v2.x, v2.y);

                            if (v) {
                                dx = p2.x - v.x;
                                dy = p2.y - v.y;
                                t = dx * dx + dy * dy;

                                if ((t < minLen)) {
                                    h = j1;
                                    k = j2;
                                    hitV = v;
                                    minLen = t;
                                }
                            }
                        }
                    }

                    if ((minLen == Number.MAX_VALUE)) {
                        err();
                    }

                    vec1 = new Array;
                    vec2 = new Array;

                    j1 = h;
                    j2 = k;
                    v1 = vec[j1];
                    v2 = vec[j2];

                    if (!pointsMatch(hitV.x, hitV.y, v2.x, v2.y)) {
                        vec1.push(hitV);
                    }
                    if (!pointsMatch(hitV.x, hitV.y, v1.x, v1.y)) {
                        vec2.push(hitV);
                    }

                    h = -1;
                    k = i1;
                    while (true) {
                        if ((k != j2)) {
                            vec1.push(vec[k]);
                        } else {
                            if (((h < 0) || h >= n)) {
                                err();
                            }
                            if (!isOnSegment(v2.x, v2.y, vec[h].x, vec[h].y, p1.x, p1.y)) {
                                vec1.push(vec[k]);
                            }
                            break;
                        }

                        h = k;
                        if (((k - 1) < 0)) {
                            k = n - 1;
                        } else {
                            k--;
                        }
                    }

                    vec1 = vec1.reverse();

                    h = -1;
                    k = i2;
                    while (true) {
                        if ((k != j1)) {
                            vec2.push(vec[k]);
                        } else {
                            if (((h < 0) || h >= n)) {
                                err();
                            }
                            if (((k == j1) && !isOnSegment(v1.x, v1.y, vec[h].x, vec[h].y, p2.x, p2.y))) {
                                vec2.push(vec[k]);
                            }
                            break;
                        }

                        h = k;
                        if (((k + 1) > n - 1)) {
                            k = 0;
                        } else {
                            k++;
                        }
                    }

                    queue.push(vec1, vec2);
                    queue.shift();

                    break;
                }
            }

            if (isConvex) {
                figsVec.push(queue.shift());
            }
        }

        return figsVec;
    }

    function hitRay(x1, y1, x2, y2, x3, y3, x4, y4) {
        var t1 = x3 - x1,
        t2 = y3 - y1,
        t3 = x2 - x1,
        t4 = y2 - y1,
        t5 = x4 - x3,
        t6 = y4 - y3,
        t7 = t4 * t5 - t3 * t6,
        a;

        a = (((t5 * t2) - t6 * t1) / t7);
        var px = x1 + a * t3,
        py = y1 + a * t4;
        var b1 = isOnSegment(x2, y2, x1, y1, px, py);
        var b2 = isOnSegment(px, py, x3, y3, x4, y4);

        if ((b1 && b2)) {
            return new b2Vec2(px, py);
        }

        return null;
    }

    function hitSegment(x1, y1, x2, y2, x3, y3, x4, y4) {
        var t1 = x3 - x1,
        t2 = y3 - y1,
        t3 = x2 - x1,
        t4 = y2 - y1,
        t5 = x4 - x3,
        t6 = y4 - y3,
        t7 = t4 * t5 - t3 * t6,
        a;

        a = (((t5 * t2) - t6 * t1) / t7);
        var px = x1 + a * t3,
        py = y1 + a * t4;
        var b1 = isOnSegment(px, py, x1, y1, x2, y2);
        var b2 = isOnSegment(px, py, x3, y3, x4, y4);

        if ((b1 && b2)) {
            return new b2Vec2(px, py);
        }

        return null;
    }

    function isOnSegment(px, py, x1, y1, x2, y2) {
        var b1 = ((((x1 + 0.1) >= px) && px >= x2 - 0.1) || (((x1 - 0.1) <= px) && px <= x2 + 0.1));
        var b2 = ((((y1 + 0.1) >= py) && py >= y2 - 0.1) || (((y1 - 0.1) <= py) && py <= y2 + 0.1));
        return ((b1 && b2) && isOnLine(px, py, x1, y1, x2, y2));
    }

    function pointsMatch(x1, y1, x2, y2) {
        var dx = (x2 >= x1) ? x2 - x1: x1 - x2,
        dy = (y2 >= y1) ? y2 - y1: y1 - y2;
        return ((dx < 0.1) && dy < 0.1);
    }

    function isOnLine(px, py, x1, y1, x2, y2) {
        if ((((x2 - x1) > 0.1) || x1 - x2 > 0.1)) {
            var a = (y2 - y1) / (x2 - x1),
            possibleY = a * (px - x1) + y1,
            diff = (possibleY > py) ? possibleY - py: py - possibleY;
            return (diff < 0.1);
        }

        return (((px - x1) < 0.1) || x1 - px < 0.1);
    }

    function det(x1, y1, x2, y2, x3, y3) {
        return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1;
    }

    function err() {
        throw new Error("A problem has occurred. Use the Validate() method to see where the problem is.");
    }

    exports.calcShapes = calcShapes;
    exports.validate = validate;
});
},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/GameObject.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var Component = require("../component/Component.js");

    var GameObject = cc.Node.extend({
        properties: ["name", "tag"],

        ctor : function (){
            this._super();

            this._components = [];
            this._properties = [];
            this._updateRequest = 0;

            this.name = "GameObject";

            this.addComponent("TransformComponent");
            
        },

        _getComponents: function(){
            return this._components;
        },

        addComponent : function(className){
            var c;

            if(typeof className === 'string') {
                c = this._components[className];
                if(c) return c;

                c = cl.ComponentManager.create(className);
                if(c == null){
                    console.log(className + "is not a valid Component");
                    return null;
                }

                this._components[className] = c;
            } else if(typeof className === 'object'){
                c = className;
                this._components[c.className] = c;
            }


            c._bind(this);
            this._components.push(c);

            if(c.onUpdate) {
                if(this._updateRequest === 0 && this.isRunning()) {
                    this.scheduleUpdate();
                }
                this._updateRequest++;
            }

            if(this.isRunning()) {
                c._enter(this);
            }

            return c;
        },

        addComponents : function(classnames){
            for(var key in classnames){
                this.addCompoent(classnames[key]);
            }
        },

        getComponent: function(className){
            return this._components[className];
        },

        removeComponent: function (className) {
            if(typeof className === 'object') {
                className = className.className;
            }

            var c = this._components[className];

            if(c != null) {
                c._unbind();

                if(c.onUpdate) {
                    this._updateRequest--;
                    if(this._updateRequest === 0) {
                        this.unscheduleUpdate();
                    }
                }


                delete this._components[className];
                var index = this._components.indexOf(c);
                this._components.splice(index, 1);
            }

            return c;
        },

        onEnter: function() {
            cc.Node.prototype.onEnter.call(this);

            for(var i=0; i<this._components.length; i++){
                this._components[i]._enter(this);
            }

            if(this._updateRequest > 0) {
                this.scheduleUpdate();
            }
        },

        update: function(dt) {
            if(!this.isRunning()) return;

            for(var key in this._components){
                var c = this._components[key];
                if(c.onUpdate) {
                    c.onUpdate(dt);
                }
            }
        },

        hitTest: function(worldPoint){
            for(var key in this._components){
                var c = this._components[key];
                if(c.hitTest != null && c.hitTest(worldPoint))
                    return true;
            }

            return false;
        },

        clone: function() {
            var json = this.toJSON();
            return GameObject.fromJSON(json);
        }
    });

    cl.defineGetterSetter(GameObject.prototype, "components", "_getComponents");

    module.exports = cl.GameObject = GameObject;
});

},{"../component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/SceneManager.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var GameObject = require("./GameObject.js");

    // private
    var _sceneMap = {};

    // SceneManager
    var SceneManager = {};



    SceneManager.loadScene = function(path, cb, force) {
        var json = _sceneMap[path];
        var self = this;

        var parseComplete = function(scene){
            if(scene && cb) cb(scene);
        }

        if(json && !force){
            parseData(json, parseComplete);
        } else {
            cc.loader.loadJson(path, function(err, json){
                if(err) throw err;

                _sceneMap[path] = json;
                
                self.parseData(json, parseComplete);
            });
        }
    };

    SceneManager.loadSceneWithContent = function(content, cb) {

        try{
            var json = JSON.parse(content); 

            var parseComplete = function(scene){
                if(scene && cb) cb(scene);
            }

            this.parseData(json, parseComplete);   
        }
        catch(err) {
            throw err;
        }
        
    };

    SceneManager.initPhysics = function(scene, data) {
        scene.physics = data;
        scene.space = cl.space = new cp.Space();

        var space = cl.space ;

        // Gravity
        space.gravity = cp.v(0, -700);


        var debugNode = new cc.PhysicsDebugNode( space );
        debugNode.visible = true ;

        var parent = scene;
        if(scene.canvas) {
            parent = scene.canvas;
        }
        parent.addChild( debugNode, 10000 );

        scene.addUpdateFunc(cl.space.step.bind(cl.space));
    }

    SceneManager.parseData = function(json, cb){
        var data = json.root;
        var self = this;

        cc.LoaderScene.preload(data.res, function () {

            var scene = new cc.Scene();
            self.initScene(scene);

            scene.res = data.res;

            var parent = scene;
            if(cl.createCanvas) {
                parent = cl.createCanvas(scene, data.canvas);
            }

            if(cl.config.physics !== 'None') {
                self.initPhysics(scene, data.physics);
            }

            for(var i=0; i<data.children.length; i++){
                var o = GameObject.fromJSON(data.children[i]);
                parent.addChild(o);
            }

            if(cb) {
                cb(scene);
            }

        }, this);
    };

    SceneManager.initScene = function(scene) {

        var updateList = [];

        scene.update = function(dt) {
            for(var i=0; i<updateList.length; i++) {
                updateList[i](dt);
            }
        }

        scene.addUpdateFunc = function(func) {
            updateList.push(func);
        }

        scene.scheduleUpdate();
    }

    module.exports = cl.SceneManager = SceneManager;
});

},{"./GameObject.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/GameObject.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/object/MeshSprite.js":[function(require,module,exports){
var TextureArray = function(){
    var array = [];
    array._push = array.push;
    array.push = function(file){
        if(file){
            if(cc.isString(file)){
                var item = cc.textureCache.addImage(file);
                item.file = file;
                this._push(item);    
            }
            else{
                this._push(file);
            }
        }
    }

    array.set = function(index, file){
        if(file){
            if(cc.isString(file)){
                var item = cc.textureCache.addImage(file);
                item.file = file;
                this[index] = item;    
            }
            else{
                this[index] = file;
            }
        }
    }

    return array;
}

cl.MeshSprite = cc.Node.extend({
    _bufferCapacity: 0,
    _buffer: null,

    //0: vertex  1: indices
    _buffersVBO: null,

    _trianglesArrayBuffer: null,
    _trianglesWebBuffer: null,
    _trianglesReader: null,

    _blendFunc: null,
    _dirty: false,

    _materials: null,

    _subMeshes: null,

    _className: "MeshSprite",

    ctor: function(){
        cc.Node.prototype.ctor.call(this);
        
        this._buffer       = [];
        this._materials    = TextureArray();
        this._subMeshes    = [];
        this._buffersVBO   = [];

        var locCmd         = this._renderCmd;
        this._blendFunc    = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    },

    setSubMesh: function(index, indices){
        this._subMeshes[index] = new Uint16Array(indices);
    },

    _getSubMeshes: function(){
        return this._subMeshes;
    },

    _setVertices: function(vertices){
        var VertexLength = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;

        this._buffer.splice(0, this._buffer.length);

        this._trianglesArrayBuffer = new ArrayBuffer(VertexLength * vertices.length);
        this._trianglesReader = new Uint8Array(this._trianglesArrayBuffer);

        for(var i=0; i<vertices.length; i++){
            var v = vertices[i];
            var nv = new cc.V3F_C4B_T2F(v._vertices, v._colors, v._texCoords, this._trianglesArrayBuffer, i*VertexLength);
            this._buffer.push(nv);
        }
    },
    _getVertices: function(){
        return this._buffer;
    },

    _getMaterials: function(){
        return this._materials;
    },
    _setMaterials: function(materials){
        this._materials.splice(0, this._materials.length);
        
        for(var i in materials){
            this._materials.push(materials[i]);
        }
    },

    rebindVertices: function() {
        this._setupVBO();
        this._dirty = true;
    },

    _setupVBO: function () {
        var gl = cc._renderContext;
        //create WebGLBuffer
        this._buffersVBO[0] = gl.createBuffer();
        // this._buffersVBO[1] = gl.createBuffer();
        this._buffersVBO[1] = [];
        for(var i=0; i<this._subMeshes.length; i++){
            this._buffersVBO[1][i] = gl.createBuffer();
        }

        this._trianglesWebBuffer = gl.createBuffer();
        this._mapBuffers();
    },

    _mapBuffers: function () {
        var gl = cc._renderContext;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._trianglesWebBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._trianglesArrayBuffer, gl.DYNAMIC_DRAW);

        for(var i=0; i<this._subMeshes.length; i++){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1][i]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._subMeshes[i], gl.STATIC_DRAW);
        }
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
    },

    // getBlendFunc: function () {
 //        return this._blendFunc;
 //    },

 //    setBlendFunc: function (blendFunc, dst) {
 //        if (dst === undefined) {
 //            this._blendFunc.src = blendFunc.src;
 //            this._blendFunc.dst = blendFunc.dst;
 //        } else {
 //            this._blendFunc.src = blendFunc;
 //            this._blendFunc.dst = dst;
 //        }
 //    },

    // setTexture: function (texture) {
    //     var _t = this;
    //     if(texture && (cc.isString(texture))){
    //         texture = cc.textureCache.addImage(texture);
    //         _t.setTexture(texture);
    //         //TODO
    //         // var size = texture.getContentSize();
    //         // _t.setTextureRect(cc.rect(0,0, size.width, size.height));
    //         //If image isn't loaded. Listen for the load event.
    //         // if(!texture._isLoaded){
    //         //     texture.addEventListener("load", function(){
    //         //         var size = texture.getContentSize();
    //         //         _t.setTextureRect(cc.rect(0,0, size.width, size.height));
    //         //     }, this);
    //         // }
    //         return;
    //     }
    //     // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
    //     cc.assert(!texture || texture instanceof cc.Texture2D, cc._LogInfos.Sprite_setTexture_2);

    //     this._texture = texture;
    //     if (!this._texture.hasPremultipliedAlpha()) {
    //         this._blendFunc.src = cc.SRC_ALPHA;
    //         this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
    //     } else {
    //         this._blendFunc.src = cc.BLEND_SRC;
    //         this._blendFunc.dst = cc.BLEND_DST;
    //     }
    // },

    // getTexture: function () {
    //     return this._texture;
    // },

    _render: function () {
        if((this._buffer==null) || (this._buffer.length === 0)) 
            return;

        var gl = cc._renderContext;
        
        gl.enable( gl.DEPTH_TEST );
        gl.depthFunc( gl.LEQUAL );

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._trianglesWebBuffer);

        if (this._dirty) {
            gl.bufferData(gl.ARRAY_BUFFER, this._trianglesArrayBuffer, gl.STREAM_DRAW);
            this._dirty = false;
        }

        for(var i=0; i<this._materials.length; i++){
            var indices = this._subMeshes[i];
            if(!indices || indices.length == 0)
                continue;

            var material = this._materials[i];
            cc.glBindTexture2DN(0, material);  

            var triangleSize = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;

            // vertex
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, triangleSize, 0);
            // color
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, triangleSize, 12);
            // texcood
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, triangleSize, 16);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1][i]);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        }
        
        gl.disable( gl.DEPTH_TEST );

        cc.incrementGLDraws(1);
        cc.checkGLErrorDebug();
    },

    clear:function () {
        this._buffer.length = 0;
        this._dirty = true;
    },

    _createRenderCmd: function () {
        return new cl.MeshSprite.WebGLRenderCmd(this);
    }
});    

var _p = cl.MeshSprite.prototype;
cl.defineGetterSetter(_p, "vertices", "_getVertices", "_setVertices");
cl.defineGetterSetter(_p, "materials", "_getMaterials");
cl.defineGetterSetter(_p, "subMeshes", "_getSubMeshes");
// cl.defineGetterSetter(_p, "texture", "getTexture", "setTexture");

cl.MeshSprite.create = function () {
    return new cl.MeshSprite();
};


// MeshSprite WebGLRenderCmd
(function(){
    cl.MeshSprite.WebGLRenderCmd = function (renderableObject) {
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    cl.MeshSprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cl.MeshSprite.WebGLRenderCmd.prototype.constructor = cl.MeshSprite.WebGLRenderCmd;

    cl.MeshSprite.WebGLRenderCmd.prototype.rendering = function (ctx) {
        var node = this._node;
        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        node._render();
    };
})();

},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/shortcode.js":[function(require,module,exports){
cl.EnumValue = function(Enum, key, value) {
    this.Enum = Enum;
    this.value = value;
    
    this.toJSON = this.toString = function() {
        return 'cl.Enum.' + Enum.name + '.' + key;
    }
}

// cl.Enum
cl.Enum = function() {
    
    var name = arguments[0];
    Array.prototype.splice.call(arguments, 0,1);

    if(cl[name]) {
        console.log("Can't regiseter Enum with an existed name [%s]", name);
    }


    var currentNumber = 0;
    var Enum = {};
    Enum.name = name;

    for(var i=0; i<arguments.length; i++) {
        var arg = arguments[i];

        var key, value;

        if(Array.isArray(arg)) {
            key = arg[0];
            currentNumber = value = arg[1];
        } else {
            key = arg;
            value = currentNumber;
        }

        Enum[key] = new cl.EnumValue(Enum, key, value);

        currentNumber++;
    }

    Enum.forEach = function(cb) {
        for(var k in this) {
            if(k !== 'name' && k !== 'forEach') {
                cb(k, this[k]);
            }
        }
    }

    cl.Enum[name] = Enum;

    return Enum;
}



// cl.Point
cl.Point = function(x, y)
{
    if (x == undefined)
        this.x = this.y = 0;
    else if (y == undefined) {
        this.x = x.x; 
        this.y = x.y;
    } else if(x == undefined && y == undefined) {
        this.x = this.y = 0;
    } else {
        this.x = x;
        this.y = y;
    }
}

cl.Point.prototype.equal = function(p){
    return this.x == p.x && this.y == p.y;
}

cl.Point.prototype.add = function(p){
    var n = new cl.Point();
    n.x = this.x + p.x;
    n.y = this.y + p.y;
    return n;
}

cl.Point.prototype.addToSelf = function(p){
    this.x += p.x;
    this.y += p.y;
    return this;
}

cl.Point.prototype.sub = function(p){
    var n = new cl.Point();
    n.x = this.x - p.x;
    n.y = this.y - p.y;
    return n;
}

cl.Point.prototype.subToSelf = function(p){
    this.x -= p.x;
    this.y -= p.y;
    return this;
}

cl.Point.prototype.mult = function(v){
    var n = new cl.Point();
    n.x = this.x * v;
    n.y = this.y * v;
    return n;
}

cl.Point.prototype.multToSelf = function(v){
    this.x *= v;
    this.y *= v;
    return this;
}

cl.Point.prototype.divide = function(v){
    var n = new cl.Point();
    n.x = this.x / v;
    n.y = this.y / v;
    return n;
}

cl.Point.prototype.divideToSelf = function(v){
    this.x /= v;
    this.y /= v;
    return this;
}

cl.Point.prototype.normalize = function(){
    var t = cc.pNormalize(this);
    this.x = t.x;
    this.y = t.y;
}

cl.Point.prototype.cross = function(p){
    return this.x * p.y - this.y * p.x;
}

cl.Point.prototype.inTriangle = function(a, b, c){

    var ab = b.sub(a),
        ac = c.sub(a), 
        ap = this.sub(a);

    var abc = ab.cross(ac);
    var abp = ab.cross(ap);
    var apc = ap.cross(ac);
    var pbc = abc - abp - apc;  

    var delta = Math.abs(abc) - Math.abs(abp) - Math.abs(apc) - Math.abs(pbc);

    return Math.abs(delta) < 0.05;        
}

cl.Point.lerp = function(a, b, alpha){
    var t = cc.pLerp(a,b,alpha);
    return cl.p(t.x, t.y);
}

cl.Point.sqrMagnitude = function(a){
    return a.x * a.x + a.y * a.y;
}


cc.p = cl.p = function(x,y){
    return new cl.Point(x, y);
}



// Math
Math.lerp = function(a, b, alpha){
    return a + (b - a) * alpha;
}

Math.clamp = function(value, min, max)
{
    if (value < min){
        value = min;
    } else {
        if (value > max) {
            value = max;
        }
    }
    return value;
}

Array.prototype.reverse = function() {
    var temp = [];
    
    for(var i=0; i<this.length; i++) {
        temp.unshift(this[i]);
    }

    return temp;
}

Number.prototype.toFixed = function(pos) {
    return Math.round( this * Math.pow(10, pos) ) / Math.pow(10, pos);
}

},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/EventDispatcher.js":[function(require,module,exports){
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $ */

/**
 * Implements a jQuery-like event dispatch pattern for non-DOM objects:
 *  - Listeners are attached via on()/one() & detached via off()
 *  - Listeners can use namespaces for easy removal
 *  - Listeners can attach to multiple events at once via a space-separated list
 *  - Events are fired via trigger()
 *  - The same listener can be attached twice, and will be called twice; but off() will detach all
 *    duplicate copies at once ('duplicate' means '===' equality - see http://jsfiddle.net/bf4p29g5/1/)
 * 
 * But it has some important differences from jQuery's non-DOM event mechanism:
 *  - More robust to listeners that throw exceptions (other listeners will still be called, and
 *    trigger() will still return control to its caller).
 *  - Events can be marked deprecated, causing on() to issue warnings
 *  - Easier to debug, since the dispatch code is much simpler
 *  - Faster, for the same reason
 *  - Uses less memory, since $(nonDOMObj).on() leaks memory in jQuery
 *  - API is simplified:
 *      - Event handlers do not have 'this' set to the event dispatcher object
 *      - Event object passed to handlers only has 'type' and 'target' fields
 *      - trigger() uses a simpler argument-list signature (like Promise APIs), rather than requiring
 *        an Array arg and ignoring additional args
 *      - trigger() does not support namespaces
 *      - For simplicity, on() does not accept a map of multiple events -> multiple handlers, nor a
 *        missing arg standing in for a bare 'return false' handler.
 * 
 * For now, Brackets uses a jQuery patch to ensure $(obj).on() and obj.on() (etc.) are identical
 * for any obj that has the EventDispatcher pattern. In the future, this may be deprecated.
 * 
 * To add EventDispatcher methods to any object, call EventDispatcher.makeEventDispatcher(obj).
 */
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    function extend(target, ref) {
        var name, value;
        for ( name in ref ) {
            value = ref[name];
            if (value !== undefined) {
                target[ name ] = value;
            }
        }
        return target;
    }
    
    
    /**
     * Split "event.namespace" string into its two parts; both parts are optional.
     * @param {string} eventName Event name and/or trailing ".namespace"
     * @return {!{event:string, ns:string}} Uses "" for missing parts.
     */
    function splitNs(eventStr) {
        var dot = eventStr.indexOf(".");
        if (dot === -1) {
            return { eventName: eventStr };
        } else {
            return { eventName: eventStr.substring(0, dot), ns: eventStr.substring(dot) };
        }
    }
    
    
    // These functions are added as mixins to any object by makeEventDispatcher()
    
    /**
     * Adds the given handler function to 'events': a space-separated list of one or more event names, each
     * with an optional ".namespace" (used by off() - see below). If the handler is already listening to this
     * event, a duplicate copy is added.
     * @param {string} events
     * @param {!function(!{type:string, target:!Object}, ...)} fn
     */
    var on = function (events, fn) {
        var eventsList = events.split(/\s+/).map(splitNs),
            i;
        
        // Check for deprecation warnings
        if (this._deprecatedEvents) {
            for (i = 0; i < eventsList.length; i++) {
                var deprecation = this._deprecatedEvents[eventsList[i].eventName];
                if (deprecation) {
                    var message = "Registering for deprecated event '" + eventsList[i].eventName + "'.";
                    if (typeof deprecation === "string") {
                        message += " Instead, use " + deprecation + ".";
                    }
                    console.warn(message, new Error().stack);
                }
            }
        }
        
        // Attach listener for each event clause
        for (i = 0; i < eventsList.length; i++) {
            var eventName = eventsList[i].eventName;
            if (!this._eventHandlers) {
                this._eventHandlers = {};
            }
            if (!this._eventHandlers[eventName]) {
                this._eventHandlers[eventName] = [];
            }
            eventsList[i].handler = fn;
            this._eventHandlers[eventName].push(eventsList[i]);
        }
        
        return this;  // for chaining
    };
    
    /**
     * Removes one or more handler functions based on the space-separated 'events' list. Each item in
     * 'events' can be: bare event name, bare .namespace, or event.namespace pair. This yields a set of
     * matching handlers. If 'fn' is ommitted, all these handlers are removed. If 'fn' is provided,
     * only handlers exactly equal to 'fn' are removed (there may still be >1, if duplicates were added).
     * @param {string} events
     * @param {?function(!{type:string, target:!Object}, ...)} fn
     */
    var off = function (events, fn) {
        if (!this._eventHandlers) {
            return this;
        }
        
        var eventsList = events.split(/\s+/).map(splitNs),
            i;
        
        var removeAllMatches = function (eventRec, eventName) {
            var handlerList = this._eventHandlers[eventName],
                k;
            if (!handlerList) {
                return;
            }
            
            // Walk backwards so it's easy to remove items
            for (k = handlerList.length - 1; k >= 0; k--) {
                // Look at ns & fn only - doRemove() has already taken care of eventName
                if (!eventRec.ns || eventRec.ns === handlerList[k].ns) {
                    var handler = handlerList[k].handler;
                    if (!fn || fn === handler || fn._eventOnceWrapper === handler) {
                        handlerList.splice(k, 1);
                    }
                }
            }
            if (!handlerList.length) {
                delete this._eventHandlers[eventName];
            }
        }.bind(this);
        
        var doRemove = function (eventRec) {
            if (eventRec.eventName) {
                // If arg calls out an event name, look at that handler list only
                removeAllMatches(eventRec, eventRec.eventName);
            } else {
                // If arg only gives a namespace, look at handler lists for all events
                for(var eventname in this._eventHandlers) {
                	removeAllMatches(eventRec, eventName);
                }
            }
        }.bind(this);
        
        // Detach listener for each event clause
        // Each clause may be: bare eventname, bare .namespace, full eventname.namespace
        for (i = 0; i < eventsList.length; i++) {
            doRemove(eventsList[i]);
        }
        
        return this;  // for chaining
    };
    
    /**
     * Attaches a handler so it's only called once (per event in the 'events' list).
     * @param {string} events
     * @param {?function(!{type:string, target:!Object}, ...)} fn
     */
    var one = function (events, fn) {
        // Wrap fn in a self-detaching handler; saved on the original fn so off() can detect it later
        if (!fn._eventOnceWrapper) {
            fn._eventOnceWrapper = function (event) {
                // Note: this wrapper is reused for all attachments of the same fn, so it shouldn't reference
                // anything from the outer closure other than 'fn'
                event.target.off(event.type, fn._eventOnceWrapper);
                fn.apply(this, arguments);
            };
        }
        return this.on(events, fn._eventOnceWrapper);
    };
    
    /**
     * Invokes all handlers for the given event (in the order they were added).
     * @param {string} eventName
     * @param {*} ... Any additional args are passed to the event handler after the event object
     */
    var trigger = function (eventName) {
        var event = { type: eventName, target: this },
            handlerList = this._eventHandlers && this._eventHandlers[eventName],
            i;
        
        if (!handlerList) {
            return;
        }
        
        // Use a clone of the list in case handlers call on()/off() while we're still in the loop
        handlerList = handlerList.slice();

        // Pass 'event' object followed by any additional args trigger() was given
        var applyArgs = Array.prototype.slice.call(arguments, 1);
        applyArgs.unshift(event);

        for (i = 0; i < handlerList.length; i++) {
            try {
                // Call one handler
                handlerList[i].handler.apply(null, applyArgs);
            } catch (err) {
                console.error("Exception in '" + eventName + "' listener on", this, String(err), err.stack);
                console.assert();  // causes dev tools to pause, just like an uncaught exception
            }
        }
    };
    
    
    /**
     * Adds the EventDispatcher APIs to the given object: on(), one(), off(), and trigger(). May also be
     * called on a prototype object - each instance will still behave independently.
     * @param {!Object} obj Object to add event-dispatch methods to
     */
    function makeEventDispatcher(obj) {
        extend(obj, {
            on: on,
            off: off,
            one: one,
            trigger: trigger,
            _EventDispatcher: true
        });
        // Later, on() may add _eventHandlers: Object.<string, Array.<{event:string, namespace:?string,
        //   handler:!function(!{type:string, target:!Object}, ...)}>> - map from eventName to an array
        //   of handler records
        // Later, markDeprecated() may add _deprecatedEvents: Object.<string, string|boolean> - map from
        //   eventName to deprecation warning info
    }
    
    /**
     * Utility for calling on() with an array of arguments to pass to event handlers (rather than a varargs
     * list). makeEventDispatcher() must have previously been called on 'dispatcher'.
     * @param {!Object} dispatcher
     * @param {string} eventName
     * @param {!Array.<*>} argsArray
     */
    function triggerWithArray(dispatcher, eventName, argsArray) {
        var triggerArgs = [eventName].concat(argsArray);
        dispatcher.trigger.apply(dispatcher, triggerArgs);
    }
    
    /**
     * Utility for attaching an event handler to an object that has not YET had makeEventDispatcher() called
     * on it, but will in the future. Once 'futureDispatcher' becomes a real event dispatcher, any handlers
     * attached here will be retained.
     * 
     * Useful with core modules that have circular dependencies (one module initially gets an empty copy of the
     * other, with no on() API present yet). Unlike other strategies like waiting for htmlReady(), this helper
     * guarantees you won't miss any future events, regardless of how soon the other module finishes init and
     * starts calling trigger().
     * 
     * @param {!Object} futureDispatcher
     * @param {string} events
     * @param {?function(!{type:string, target:!Object}, ...)} fn
     */
    function on_duringInit(futureDispatcher, events, fn) {
        on.call(futureDispatcher, events, fn);
    }
    
    /**
     * Mark a given event name as deprecated, such that on() will emit warnings when called with it.
     * May be called before makeEventDispatcher(). May be called on a prototype where makeEventDispatcher()
     * is called separately per instance (i.e. in the constructor). Should be called before clients have
     * a chance to start calling on().
     * @param {!Object} obj Event dispatcher object
     * @param {string} eventName Name of deprecated event
     * @param {string=} insteadStr Suggested thing to use instead
     */
    function markDeprecated(obj, eventName, insteadStr) {
        // Mark event as deprecated - on() will emit warnings when called with this event
        if (!obj._deprecatedEvents) {
            obj._deprecatedEvents = {};
        }
        obj._deprecatedEvents[eventName] = insteadStr || true;
    }
    
    
    exports.makeEventDispatcher = makeEventDispatcher;
    exports.triggerWithArray    = triggerWithArray;
    exports.on_duringInit       = on_duringInit;
    exports.markDeprecated      = markDeprecated;
});

},{}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/KeyManager.js":[function(require,module,exports){
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

},{"./Time.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Time.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Serialization.js":[function(require,module,exports){
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
},{"../component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","../core/GameObject.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/GameObject.js"}],"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Time.js":[function(require,module,exports){
(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {
    "use strict";

    var time = 0;

    var Time = {
        update: function(dt) {
            time += 0.01;
        }
    }

    cl.defineGetterSetter(Time, 'now', function() {
        return time;
    });

    setInterval(Time.update, 10);

    module.exports = Time;
});
},{}],"/Users/youyou/Desktop/test/src/CameraFollow.js":[function(require,module,exports){
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

    var Component = require("../frameworks/cocos2d-html5/cocoslite/component/Component.js");

    var Params = function() {

        this.ctor = function() {
            this._super([]);
        }

        this._folder_ = "Script";
    }

    var CameraFollow = Component.extendComponent("CameraFollow", new Params);

    
    exports.Constructor = CameraFollow;
    exports.Params = Params;
});
},{"../frameworks/cocos2d-html5/cocoslite/component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/src/Run.js":[function(require,module,exports){
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

    var Component  = require("../frameworks/cocos2d-html5/cocoslite/component/Component.js");
    var KeyManager = require("../frameworks/cocos2d-html5/cocoslite/utils/KeyManager.js");

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
},{"../frameworks/cocos2d-html5/cocoslite/component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","../frameworks/cocos2d-html5/cocoslite/utils/KeyManager.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/KeyManager.js"}],"/Users/youyou/Desktop/test/src/terrain/DynamicMesh.js":[function(require,module,exports){
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

    
    cl.DynamicMesh = function(){
        this.clear();
    };

    var _p = cl.DynamicMesh.prototype;
    _p.clear = function(){
        this._indices = [];
        this._verts = [];

        this._color = cc.color.WHITE;
    };

    _p.build = function(aMesh){
        aMesh.vertices = this._verts;
        aMesh.rebindVertices();
    };

    _p.addVertex = function() {
        var aX, aY, aZ, aU, aV;

        if(arguments.length === 5){
            aX = arguments[0]; aY=arguments[1]; aZ=arguments[2]; aU=arguments[3]; aV=arguments[4];
        } else if(arguments.length === 3){
            if(typeof arguments[0] === "number"){
                aX = arguments[0]; aY=arguments[1]; aZ=arguments[2]; aU=aV=0;
            }
            else{
                aX = arguments[0].x; aY=arguments[0].y; aZ=arguments[1]; aU=arguments[2].x; aV=arguments[2].y;
            }
        } 
//        else if(arguments.length === 4){
//
//        }

        // cc.log("vertex : %f, %f, %f, %f, %f     %i", aX, aY, aZ, aU, aV, this._verts.length);
        var v = new cc.V3F_C4B_T2F({x:aX,y:aY,z:aZ}, this._color, {u:aU,v:aV});
        this._verts.push(v);
        return this._verts.length-1;
    };

    _p.addFace = function(aV1, aV2, aV3, aV4) {
        var indices = this._indices;

        if(arguments.length === 3){
            indices.push (aV1);
            indices.push (aV2);
            indices.push (aV3);
        } else if(arguments.length === 4) {
            indices.push (aV3);
            indices.push (aV2);
            indices.push (aV1);

            indices.push (aV4);
            indices.push (aV3);
            indices.push (aV1);
        }
    };

    _p.getCurrentTriangleList = function(aStart) {
        aStart = aStart ? aStart : 0;

        var result = [];
        for (var i = aStart; i < this._indices.length; i++) {
            result.push(this._indices[i]);
        }
        return result;
    };

    _p._getVertCount = function(){
        return this._verts.length;
    };

    cl.defineGetterSetter(_p, "vertCount", "_getVertCount");

});

},{}],"/Users/youyou/Desktop/test/src/terrain/TerrainComponent.js":[function(require,module,exports){
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

    var Component = require("../../frameworks/cocos2d-html5/cocoslite/component/Component.js");

    var TerrainFillMode = cl.Enum(
        "TerrainFillMode",

        // The interior of the path will be filled, and edges will be treated like a polygon.
        "Closed",
        // Drops some extra vertices down, and fill the interior. Edges only around the path itself.
        "Skirt",
        // Doesn't fill the interior at all. Just edges.
        "None",
        // Fills the outside of the path rather than the interior, also inverts the edges, upside-down.
        "InvertedClosed"
    );

    var ctor = function() {

        // private
        var path = null,
            mesh = null,
            unitsPerUV = cl.p(1,1),
            terrainMaterial = new cl.TerrainMaterial(),
            dMesh = new cl.DynamicMesh();

        Component.init(this, {
            fill: TerrainFillMode.Closed,
            fillY: 0,
            fillZ: -0.5,
            splitCorners: true,
            smoothPath: false,
            splistDist: 4,
            pixelsPerUnit: 32,
            vertexColor: cc.color.White,
            createCollider: true,
            depth: 4,
            sufaceOffset: [0,0,0,0],

            _getTerrainMaterial: function() {
                return terrainMaterial;
            },
            _setTerrainMaterial: function(file) {
                terrainMaterial.initWithFile(file);
                terrainMaterial.on('loaded', this.recreatePath.bind(this));
            },

            toJSONterrainMaterial: function() {
                return terrainMaterial ? terrainMaterial.file : "";
            },

            recreatePath: function() {
                var fill = this.fill;

                path = this.getComponent("TerrainPathComponent");
                mesh = this.getComponent("MeshComponent");

                if(!terrainMaterial || terrainMaterial.loading || !mesh) {
                    return;
                }

                if (mesh.materials.length === 0 || mesh.materials[0].file !== terrainMaterial.edgeMaterial.file || mesh.materials[1].file !== terrainMaterial.fillMaterial.file)
                {
                    mesh.materials.set(0, terrainMaterial.fillMaterial);
                    mesh.materials.set(1, terrainMaterial.edgeMaterial);

                    if (!terrainMaterial.has(cl.Enum.TerrainDirection.Left) &&
                        !terrainMaterial.has(cl.Enum.TerrainDirection.Right))
                    {
                        this.splitCorners = false;
                    }
                    // else
                    // {
                    //     this.splitCorners = true;
                    // }
                }

                dMesh.clear();
                if(path.count < 2){
                    this.getComponent("MeshComponent").file = null;
                    return;
                }

                this._unitsPerUV = cl.p(5.33333, 5.33333);

                var segments = [];
                var self = this;
                segments = this._getSegments(path.getVerts(this.smoothPath, this.splistDist, this.splitCorners));
                segments = segments.sort(function(a,b){
                    var d1 = self._getDescription(a);
                    var d2 = self._getDescription(b);
                    return d2.zOffset < d1.zOffset;
                });

                for (var i = 0; i < segments.length; i++) {
                    this._addSegment (segments[i], segments.length <= 1 && path.closed);
                }
                var submesh1 = dMesh.getCurrentTriangleList();

                // add a fill if the user desires
                if (fill === TerrainFillMode.Skirt && terrainMaterial.fillMaterial !== null)
                {
                    this._addFill(true);
                }
                else if ((fill === TerrainFillMode.Closed || fill === TerrainFillMode.InvertedClosed) && terrainMaterial.fillMaterial !== null)
                {
                    this._addFill(false);
                }
    //            else if (fill === TerrainFillMode.None) { }
                var submesh2 = dMesh.getCurrentTriangleList(submesh1.length);

                mesh.setSubMesh(1, submesh1);
                mesh.setSubMesh(0, submesh2);
                dMesh.build(mesh);

                if(this.createCollider) {
                    var poly = this.getComponent('PhysicsPoly');
                    if(!poly) {
                        poly = this.addComponent('PhysicsPoly');
                    }

                    poly.verts = path.pathVerts;
                }
            },

            // private function

            _getDescription: function (aSegment) {
                var dir = path.getDirectionWithSegment(aSegment, 0, this.fill === TerrainFillMode.InvertedClosed);
                return terrainMaterial.getDescriptor(dir);
            },

            _getSegments: function (aPath)
            {
                var segments = [];
                if (this.splitCorners)
                {
                    segments = path.getSegments(aPath);
                }
                else
                {
                    segments.push(aPath);
                }
                if (path.closed && this.smoothPath === false)
                {
                    path.closeEnds(segments, this.splitCorners);
                }
                return segments;
            },

            _addSegment: function(aSegment, aClosed) {
                var unitsPerUV  = this._unitsPerUV;
                var fill        = this.fill;

                var desc        = this._getDescription(aSegment);
                var bodyID      = Math.round(Math.random() * (desc.body.length-1));
                var body        = terrainMaterial.toUV( desc.body[bodyID] );
                var bodyWidth   = body.width * unitsPerUV.x;

                // int tSeed = UnityEngine.Random.seed;

                var capLeftSlideDir  = aSegment[1].sub(aSegment[0]);
                var capRightSlideDir = aSegment[aSegment.length-2].sub(aSegment[aSegment.length-1]);
                capLeftSlideDir  = cc.pNormalize(capLeftSlideDir);
                capRightSlideDir = cc.pNormalize(capRightSlideDir);
                aSegment[0                ].subToSelf(cc.pMult(capLeftSlideDir,  desc.capOffset));
                aSegment[aSegment.length-1].subToSelf(cc.pMult(capRightSlideDir, desc.capOffset));

                for (var i = 0; i < aSegment.length-1; i++) {
                    var norm1   = cl.p();
                    var norm2   = cl.p();
                    var   length  = cc.pDistance(aSegment[i+1], aSegment[i]);
                    var   repeats = Math.max(1, Math.floor(length / bodyWidth));

                    norm1 = path.getNormal(aSegment, i,   aClosed);
                    norm2 = path.getNormal(aSegment, i+1, aClosed);

                    for (var t = 1; t < repeats+1; t++) {
                        // UnityEngine.Random.seed = (int)(transform.position.x * 100000 + transform.position.y * 10000 + i * 100 + t);
                        bodyID = Math.round(Math.random() * (desc.body.length-1));
                        body   = this.terrainMaterial.toUV( desc.body[bodyID] );
                        var pos1, pos2, n1, n2;

                        pos1 = cl.Point.lerp(aSegment[i], aSegment[i + 1], (t - 1) / repeats);
                        pos2 = cl.Point.lerp(aSegment[i], aSegment[i + 1], t / repeats);
                        n1   = cl.Point.lerp(norm1, norm2, (t - 1) / repeats);
                        n2   = cl.Point.lerp(norm1, norm2, t / repeats);

                        var d    = (body.height / 2) * unitsPerUV.y;
                        var yOff = fill === TerrainFillMode.InvertedClosed ? -desc.yOffset : desc.yOffset;
                        var   v1 = dMesh.addVertex(pos1.x + n1.x * (d + yOff), pos1.y + n1.y * (d + yOff), desc.zOffset, body.x,    fill === TerrainFillMode.InvertedClosed ? body.yMax : body.y);
                        var   v2 = dMesh.addVertex(pos1.x - n1.x * (d - yOff), pos1.y - n1.y * (d - yOff), desc.zOffset, body.x,    fill === TerrainFillMode.InvertedClosed ? body.y    : body.yMax);
                        var   v3 = dMesh.addVertex(pos2.x + n2.x * (d + yOff), pos2.y + n2.y * (d + yOff), desc.zOffset, body.xMax, fill === TerrainFillMode.InvertedClosed ? body.yMax : body.y);
                        var   v4 = dMesh.addVertex(pos2.x - n2.x * (d - yOff), pos2.y - n2.y * (d - yOff), desc.zOffset, body.xMax, fill === TerrainFillMode.InvertedClosed ? body.y    : body.yMax);
                        dMesh.addFace(v1, v3, v4, v2);
                    }
                }
                if (!aClosed)
                {
                    this._addCap(aSegment, desc, -1);
                    this._addCap(aSegment, desc, 1);
                }
                // UnityEngine.Random.seed = tSeed;
            },

            _addCap: function (aSegment, aDesc, aDir) {
                var unitsPerUV  = this._unitsPerUV;
                var fill        = this.fill;

                var index = 0;
                var dir   = cl.p();
                if (aDir < 0) {
                    index = 0;
                    dir   = aSegment[0].sub(aSegment[1]);
                } else {
                    index = aSegment.length-1;
                    dir   = aSegment[aSegment.length-1].sub(aSegment[aSegment.length-2]);
                }
                dir.normalize();
                var norm = path.getNormal(aSegment, index, false);
                var pos  = aSegment[index];
                var    lCap = fill === TerrainFillMode.InvertedClosed ? terrainMaterial.toUV(aDesc.rightCap) : terrainMaterial.toUV(aDesc.leftCap);
                var    rCap = fill === TerrainFillMode.InvertedClosed ? terrainMaterial.toUV(aDesc.leftCap ) : terrainMaterial.toUV(aDesc.rightCap);
                var    yOff = fill === TerrainFillMode.InvertedClosed ? -aDesc.yOffset : aDesc.yOffset;

                if (aDir < 0) {
                    var width =  lCap.width     * unitsPerUV.x;
                    var scale = (lCap.height/2) * unitsPerUV.y;

                    var v1 = dMesh.addVertex(pos.add(dir.mult(width)).add(norm.mult(scale + yOff)), aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed? lCap.xMax : lCap.x, fill === TerrainFillMode.InvertedClosed ? lCap.yMax : lCap.y));
                    var v2 = dMesh.addVertex(pos.add(norm.mult(scale + yOff)), aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? lCap.x : lCap.xMax, fill === TerrainFillMode.InvertedClosed ? lCap.yMax : lCap.y));

                    var v3 = dMesh.addVertex(pos.sub(norm.mult(scale - yOff)), aDesc.zOffset, cc.p(fill === TerrainFillMode.InvertedClosed ? lCap.x : lCap.xMax, fill === TerrainFillMode.InvertedClosed ? lCap.y : lCap.yMax));
                    var v4 = dMesh.addVertex(pos.add(dir.mult(width)).sub(norm.mult(scale - yOff)), aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? lCap.xMax : lCap.x, fill === TerrainFillMode.InvertedClosed ? lCap.y : lCap.yMax));
                    dMesh.addFace(v1, v2, v3, v4);
                } else {
                    var width =  rCap.width     * unitsPerUV.x;
                    var scale = (rCap.height/2) * unitsPerUV.y;

                    var v1 = dMesh.addVertex(pos.add(dir.mult(width)).add(norm.mult(scale + yOff)), aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? rCap.x : rCap.xMax, fill === TerrainFillMode.InvertedClosed ? rCap.yMax : rCap.y));
                    var v2 = dMesh.addVertex(pos.add(norm.mult(scale + yOff)),               aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? rCap.xMax : rCap.x, fill === TerrainFillMode.InvertedClosed ? rCap.yMax : rCap.y));

                    var v3 = dMesh.addVertex(pos.sub(norm.mult(scale - yOff)),               aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? rCap.xMax : rCap.x, fill === TerrainFillMode.InvertedClosed ? rCap.y : rCap.yMax));
                    var v4 = dMesh.addVertex(pos.add(dir.mult(width)).sub(norm.mult(scale - yOff)), aDesc.zOffset, cl.p(fill === TerrainFillMode.InvertedClosed ? rCap.x : rCap.xMax, fill === TerrainFillMode.InvertedClosed ? rCap.y : rCap.yMax));
                    dMesh.addFace(v4, v3, v2, v1);
                }
            },

            _addFill: function (aSkirt) {

                var fillVerts = path.getVerts(this.smoothPath, this.splistDist, this.splitCorners);
                var scale     = cl.p();

                // scale is different for the fill texture
                if (terrainMaterial.fillMaterial !== null)
                {
                    scale = cc.p(
                        terrainMaterial.fillMaterial.width  / this.pixelsPerUnit,
                        terrainMaterial.fillMaterial.height / this.pixelsPerUnit);
                }

                if (aSkirt)
                {
                    var start = fillVerts[0];
                    var end   = fillVerts[fillVerts.length - 1];

                    fillVerts.push(cl.p(end.x, this.fillY));
                    fillVerts.push(cl.p(Math.lerp(end.x, start.x, 0.33), this.fillY));
                    fillVerts.push(cl.p(Math.lerp(end.x, start.x, 0.66), this.fillY));
                    fillVerts.push(cl.p(start.x, this.fillY));
                }

                var offset  = dMesh.vertCount;
                var indices = cl.Triangulator.getIndices(fillVerts, true, this.fill === TerrainFillMode.InvertedClosed);
                for (var i = 0; i < fillVerts.length; i++) {
                    dMesh.addVertex(fillVerts[i].x, fillVerts[i].y, this.fillZ, fillVerts[i].x / scale.x, fillVerts[i].y / scale.y);
                }
                for (var i = 0; i < indices.length; i+=3) {
                    dMesh.addFace(indices[i] + offset,
                                  indices[i+1] + offset,
                                  indices[i+2] + offset);
                }
            }
        });
        

        cl.defineGetterSetter(this, "terrainMaterial", "_getTerrainMaterial", "_setTerrainMaterial");

        this._super(["MeshComponent", "TerrainPathComponent"]);
    }

    var TerrainComponent = Component.extendComponent("TerrainComponent", {
        properties: ["fill", "fillY", "fillZ", "splitCorners", "smoothPath", "splistDist", 
                    "pixelsPerUnit", "vertexColor", "createCollider", "terrainMaterial"],

        ctor: ctor,

        _folder_ :  "terrain"
    });


    exports.Params = ctor;
    exports.Component = TerrainComponent;

});

},{"../../frameworks/cocos2d-html5/cocoslite/component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/src/terrain/TerrainMaterial.js":[function(require,module,exports){
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global cl, cc*/

(function (factory) {
    if(typeof exports === 'object') {
        factory(require, module.exports, module);
    } else if(typeof define === 'function') {
        define(factory);
    }
})(function(require, exports, module) {

    var EventDispatcher = require("../../frameworks/cocos2d-html5/cocoslite/utils/EventDispatcher.js");
    var Serialization   = require("../../frameworks/cocos2d-html5/cocoslite/utils/Serialization.js");

    var TerrainDirection = cl.Enum('TerrainDirection', 'Top', 'Left', 'Right', 'Bottom');

    cl.TerrainSegmentDescription = function(applyTo) {
        this.zOffset = 0;
        this.yOffset = 0;
        this.capOffset = 0;
        this.applyTo = applyTo ? applyTo : TerrainDirection.Top;
    };


    cl.TerrainMaterial = function() {
        this._fillMaterialFile = "";
        this._edgeMaterialFile = "";

        this._fillMaterial = null;
        this._edgeMaterial = null;

        this.descriptors = [];

        var self = this;
        TerrainDirection.forEach(function(key, value) {
            self.descriptors.push(new cl.TerrainSegmentDescription(value));
        });

        EventDispatcher.makeEventDispatcher(this);
    };

    var _p = cl.TerrainMaterial.prototype;

    _p._getFillMaterial = function(){
        return this._fillMaterial;
    };
    
    _p._setFillMaterial = function(texture){
        if(texture && (cc.isString(texture))){
            if(texture === this._fillMaterialFile) {
                return;
            }

            this._fillMaterialFile = texture;
            this._fillMaterial = cc.textureCache.addImage(texture);
            this._fillMaterial.file = texture;
        }
    };

    _p._getEdgeMaterial = function(){
        return this._edgeMaterial;
    };
    
    _p._setEdgeMaterial = function(texture){
        if(texture && (cc.isString(texture))){
            if(texture === this._edgeMaterialFile) {
                return;
            }

            this._edgeMaterialFile = texture;
            this._edgeMaterial = cc.textureCache.addImage(texture);
            this._edgeMaterial.file = texture;
        }
    };

    _p.getDescriptor = function(aDirection) {
        var descriptors = this.descriptors;
        for (var i = 0; i < descriptors.length; i++) {
            if (descriptors[i].applyTo === aDirection) {
                return descriptors[i];
            }
        }
        if (descriptors.length > 0) {
            return descriptors[0];
        }
        return new cl.TerrainSegmentDescription();
    };

    _p.toUV = function(aPixelUVs) {
        if(!aPixelUVs) {
            return;
        }

        var edgeMaterial = this.edgeMaterial;
        if (edgeMaterial === null) {
            return aPixelUVs;
        }
        var rect = new cc.rect(
            aPixelUVs.x        / edgeMaterial.width,
            aPixelUVs.y 	   / edgeMaterial.height,
            aPixelUVs.width    / edgeMaterial.width,
            aPixelUVs.height   / edgeMaterial.height);

        rect.xMax = rect.x + rect.width;
        rect.yMax = rect.y + rect.height;
        return rect;
    };

    _p.has = function(aDirection){
        for (var i = 0; i < this.descriptors.length; i++) {
            if (this.descriptors[i].applyTo === aDirection) {
                return true;
            }
        }
        return false;	
    };


    cl.defineGetterSetter(_p, "fillMaterial", "_getFillMaterial", "_setFillMaterial");
    cl.defineGetterSetter(_p, "edgeMaterial", "_getEdgeMaterial", "_setEdgeMaterial");

    cl.TerrainMaterial.prototype.initWithFile = function(file, cb){
        var self = this;

        if(file && this.file !== file){

            this.file = file;
            this.loading = true;

            var url = cc.loader.getUrl(cc.loader.resPath, file);
            cc.loader.loadJson(url, function(err, json){
                if(err) {
                    throw err;
                }

                self.initWithJson(json);
                self.loading = false;

                self.trigger("loaded");

                if(cb) {
                    cb();
                }
            }, Serialization.tryReviver);
        }
    };

    cl.TerrainMaterial.prototype.initWithJson = function(json){

        this.fillMaterial = json.fillMaterial;
        this.edgeMaterial = json.edgeMaterial;
        this.descriptors  = json.descriptors;

        return this;
    };
});
},{"../../frameworks/cocos2d-html5/cocoslite/utils/EventDispatcher.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/EventDispatcher.js","../../frameworks/cocos2d-html5/cocoslite/utils/Serialization.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Serialization.js"}],"/Users/youyou/Desktop/test/src/terrain/TerrainPathComponent.js":[function(require,module,exports){
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

    var Component = require("../../frameworks/cocos2d-html5/cocoslite/component/Component.js");
    
    var TerrainPathComponent = Component.extendComponent("TerrainPathComponent", {
        properties: ["closed", "pathVerts"],
        
        ctor: function () {

            this.closed = false;
            this._pathVerts = [];

            this._super();
        },

        _getPathVerts: function(){
            return this._pathVerts;
        },
        _setPathVerts: function(verts){
            this._pathVerts.splice(0, this._pathVerts.length);

            for(var i=0; i<verts.length; i++){
                this._pathVerts.push(cl.p(verts[i]));
            }
        },

        _getCount: function(){
            return this.pathVerts.length;
        },

        // todo
        reCenter: function() {
//            var center = cc.p(0,0);
//            var transform = this.getComponent("TransformComponent");
//
//            for(var i=0; i<this.pathVerts.length; i++){
//                center.addToSelf(this.pathVerts[i]);
//            }
//            center = center.divide(this.pathVerts.length).add(cc.p(t.x, t.y));
        },

        getVerts: function (aSmoothed, aSplitDistance, aSplitCorners)
        {
            if (aSmoothed) {
                return this.getVertsSmoothed(aSplitDistance, aSplitCorners);
            }
            else {
                return this.getVertsRaw();
            }
        },

        getVertsRaw: function ()
        {
            var result = [];
            for(var i=0; i<this.pathVerts.length; i++){
                result.push(cl.p(this.pathVerts[i]));
            }
            return result;
        },

        getVertsSmoothed: function(aSplitDistance, aSplitCorners)
        {
            var closed = this.closed;
            var result = [];
            if (aSplitCorners)
            {
                var segments = this.getSegments(this.pathVerts);
                if (closed) {
                    this.closeEnds(segments, aSplitCorners);
                }
                
                if (segments.length > 1)
                {
                    for (var i = 0; i < segments.length; i++)
                    {
                        segments[i] = this.smoothSegment(segments[i], aSplitDistance, false);
                        
                        if (i !== 0 && segments[i].length > 0) {
                            segments[i].splice(0,1);
                        }
                        
                        for(var j=0; j<segments[i].length; j++){
                            result.push(segments[i][j]);
                        }
                    }
                }
                else
                {
                    result = this.smoothSegment(this.pathVerts, aSplitDistance, closed);
                    if (closed) {
                        result.push(this.pathVerts[0]);
                    }
                }
            }
            else
            {
                result = this.smoothSegment(this.pathVerts, aSplitDistance, closed);
                if (closed) {
                    result.push(this.pathVerts[0]);
                }
            }
            return result;
        },

        getClosestSeg: function (aPoint)
        {
            var pathVerts = this.pathVerts;
            var closed = this.closed;

            var dist  = 100000000; //float.MaxValue;
            var seg   = -1;
            var count = closed ? pathVerts.length : pathVerts.length-1;
            for (var i = 0; i < count; i++)
            {
                var next  = i === pathVerts.length -1 ? 0 : i + 1;
                var pt    = this.getClosetPointOnLine(pathVerts[i], pathVerts[next], aPoint, true);
                var tDist = cl.Point.sqrMagnitude(aPoint.sub(pt));
                if (tDist < dist)
                {
                    dist = tDist;
                    seg  = i;
                }
            }
            if (!closed)
            {
                var tDist = cl.Point.sqrMagnitude(aPoint.sub(pathVerts[pathVerts.length - 1]));
                if (tDist <= dist)
                {
                    seg = pathVerts.length - 1;
                }
                tDist = cl.Point.sqrMagnitude(aPoint.sub(pathVerts[0]));
                if (tDist <= dist)
                {
                    seg = pathVerts.length - 1;
                }
            }
            return seg;
        },

        // static function
        getSegments: function(aPath)
        {
            var segments = [];
            var currSegment = [];
            for (var i = 0; i < aPath.length; i++)
            {
                currSegment.push(cl.p(aPath[i]));
                if (this.isSplit(aPath, i))
                {
                    segments.push(currSegment);
                    currSegment = [];
                    currSegment.push(cl.p(aPath[i]));
                }
            }
            segments.push(currSegment);
            return segments;
        },

        smoothSegment: function(aSegment, aSplitDistance, aClosed){
            var result = aSegment.slice(0);
            var curr   = 0;
            var count  = aClosed ? aSegment.length : aSegment.length - 1;
            for (var i = 0; i < count; i++)
            {
                var next   = i === count - 1 ? aClosed ? 0 : aSegment.length-1 : i+1;
                var splits = Math.floor(cc.pDistance(aSegment[i], aSegment[next]) / aSplitDistance);
                for (var t = 0; t < splits; t++)
                {
                    var percentage = (t + 1) / (splits + 1);
                    result.splice(curr + 1, 0, this.hermiteGetPt(aSegment, i, percentage, aClosed));
                    curr += 1;
                }
                curr += 1;
            }
            return result;
        },

        hermiteGetPt: function (aSegment, i, aPercentage, aClosed, aTension, aBias)
        {
            aTension = aTension ? aTension : 0;
            aBias    = aBias    ? aBias    : 0;

            var a1 = aClosed ? i - 1 < 0 ? aSegment.length - 2 : i - 1 : Math.clamp(i - 1, 0, aSegment.length - 1);
            var a2 = i;
            var a3 = aClosed ? (i + 1) % (aSegment.length) : Math.clamp(i + 1, 0, aSegment.length - 1);
            var a4 = aClosed ? (i + 2) % (aSegment.length) : Math.clamp(i + 2, 0, aSegment.length - 1);

            return cl.p(
                this.hermite(aSegment[a1].x, aSegment[a2].x, aSegment[a3].x, aSegment[a4].x, aPercentage, aTension, aBias),
                this.hermite(aSegment[a1].y, aSegment[a2].y, aSegment[a3].y, aSegment[a4].y, aPercentage, aTension, aBias));
        },

        hermite: function(v1, v2, v3, v4, aPercentage, aTension, aBias)
        {
            var mu2 = aPercentage * aPercentage;
            var mu3 = mu2 * aPercentage;
            var m0 = (v2 - v1) * (1 + aBias) * (1 - aTension) / 2;
            m0 += (v3 - v2) * (1 - aBias) * (1 - aTension) / 2;
            var m1 = (v3 - v2) * (1 + aBias) * (1 - aTension) / 2;
            m1 += (v4 - v3) * (1 - aBias) * (1 - aTension) / 2;
            var a0 = 2 * mu3 - 3 * mu2 + 1;
            var a1 = mu3 - 2 * mu2 + aPercentage;
            var a2 = mu3 - mu2;
            var a3 = -2 * mu3 + 3 * mu2;

            return (a0 * v2 + a1 * m0 + a2 * m1 + a3 * v3);
        },

        isSplit: function(aSegment, i)
        {
            if (i === 0 || i === aSegment.length - 1) {
                return false;
            }

            return this.getDirection(aSegment[i - 1], aSegment[i]) !== this.getDirection(aSegment[i], aSegment[i + 1]);
        },

        getDirection: function(aOne, aTwo)
        {
            var dir = aOne.sub(aTwo);
            dir = cl.p(-dir.y, dir.x);
            if (Math.abs(dir.x) > Math.abs(dir.y))
            {
                if (dir.x < 0) {
                    return cl.Enum.TerrainDirection.Left;
                }
                else {
                    return cl.Enum.TerrainDirection.Right;
                }
            }
            else
            {
                if (dir.y < 0) {
                    return cl.Enum.TerrainDirection.Bottom;
                }
                else {
                    return cl.Enum.TerrainDirection.Top;
                }
            }
        },

        getDirectionWithSegment: function(aSegment, i, aInvert, aClosed)
        {
            var next = i+1;
            if (i < 0) {
                if (aClosed) {
                    i    = aSegment.length-2;
                    next = 0;
                } else {
                    i=0;
                    next = 1;
                }
            }
            var dir = aSegment[next > aSegment.length-1? (aClosed? aSegment.length-1 : i-1) : next].sub(aSegment[i]);
            dir         = new cc.p(-dir.y, dir.x);
            if (Math.abs(dir.x) > Math.abs(dir.y))
            {
                if (dir.x < 0) {
                    return aInvert ? cl.Enum.TerrainDirection.Right : cl.Enum.TerrainDirection.Left;
                }
                else {
                    return aInvert ? cl.Enum.TerrainDirection.Left  : cl.Enum.TerrainDirection.Right;
                }
            }
            else
            {
                if (dir.y < 0) {
                    return aInvert ? cl.Enum.TerrainDirection.Top    : cl.Enum.TerrainDirection.Bottom;
                }
                else {
                    return aInvert ? cl.Enum.TerrainDirection.Bottom : cl.Enum.TerrainDirection.Top;
                }
            }
        },

        closeEnds: function(aSegmentList, aCorners)
        {
            var start = aSegmentList[0][0];
            var startNext = aSegmentList[0][1];

            var end = aSegmentList[aSegmentList.length - 1][aSegmentList[aSegmentList.length - 1].length - 1];
            var endPrev = aSegmentList[aSegmentList.length - 1][aSegmentList[aSegmentList.length - 1].length - 2];

            if (aCorners === false) {
                aSegmentList[0].push(start);
                return true;
            }

            var endCorner = this.getDirection(endPrev, end) !== this.getDirection(end, start);
            var startCorner = this.getDirection(end, start) !== this.getDirection(start, startNext);

            if (endCorner && startCorner)
            {
                var lastSeg = [];
                lastSeg.push(end);
                lastSeg.push(start);

                aSegmentList.push(lastSeg);
            }
            else if (endCorner && !startCorner)
            {
                aSegmentList[0].splice(0, 0, end);
            }
            else if (!endCorner && startCorner)
            {
                aSegmentList[aSegmentList.length - 1].push(start);
            }
            else
            {
                var last = aSegmentList[aSegmentList.length - 1];
                for(var i=0; i<last.length; i++) {
                    aSegmentList[0].splice(i, 0, last[i]);
                }
                aSegmentList.splice(aSegmentList.length - 1, 1);
            }
            return true;
        },

        getNormal: function (aSegment, i,  aClosed) {
            var curr = aClosed && i === aSegment.length - 1 ? aSegment[0] : aSegment[i];

            // get the vertex before the current vertex
            var prev = cl.p();
            if (i-1 < 0) {
                if (aClosed) {
                    prev = aSegment[aSegment.length-2];
                } else {
                    prev = curr.sub(aSegment[i+1].sub(curr));
                }
            } else {
                prev = aSegment[i-1];
            }

            // get the vertex after the current vertex
            var next = cl.p();
            if (i+1 > aSegment.length-1) {
                if (aClosed) {
                    next = aSegment[1];
                } else {
                    next = curr.sub(aSegment[i-1].sub(curr));
                }
            } else {
                next = aSegment[i+1];
            }

            prev = prev.sub(curr);
            next = next.sub(curr);

            prev.normalize();
            next.normalize();

            prev = new cl.p(-prev.y, prev.x);
            next = new cl.p(next.y, -next.x);

            var norm = (prev.add(next)).divide(2);
            norm.normalize();

            norm.y *= -1;
            norm.x *= -1;

            return norm;
        },

        getClosetPointOnLine: function(aStart, aEnd, aPoint, aClamp)
        {
            var AP = aPoint.sub(aStart);
            var AB = aEnd.sub(aStart);
            var ab2 = AB.x*AB.x + AB.y*AB.y;
            var ap_ab = AP.x*AB.x + AP.y*AB.y;
            var t = ap_ab / ab2;
            if (aClamp) {
                 if (t < 0) {
                     t = 0;
                 }
                 else if (t > 1) {
                     t = 1;
                 }
            }
            var Closest = aStart.add(AB.mult(t));
            return Closest;
        },

        _folder_:  "terrain"
    });

    var _p = TerrainPathComponent.prototype;

    cl.defineGetterSetter(_p, "count", "_getCount");
    cl.defineGetterSetter(_p, "pathVerts", "_getPathVerts", "_setPathVerts");

});

},{"../../frameworks/cocos2d-html5/cocoslite/component/Component.js":"/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js"}],"/Users/youyou/Desktop/test/src/terrain/Triangulator.js":[function(require,module,exports){
/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global cl*/

(function(){
    "use strict";
    
    cl.Triangulator = {};

    cl.Triangulator.getIndices = function (aPoints, aTreatAsPath, aInvert) {
        var tris   = [];
        var bounds = cl.Triangulator.getBounds(aPoints);

        // it's easiest if we add in some all-encompassing tris, and then remove them later
        aPoints.push(cl.p(bounds.x - (bounds.z - bounds.x)*1, bounds.w - (bounds.y - bounds.w)*1)); // 4
        aPoints.push(cl.p(bounds.z + (bounds.z - bounds.x)*1, bounds.w - (bounds.y - bounds.w)*1)); // 3
        aPoints.push(cl.p(bounds.z + (bounds.z - bounds.x)*1, bounds.y + (bounds.y - bounds.w)*1)); // 2
        aPoints.push(cl.p(bounds.x - (bounds.z - bounds.x)*1, bounds.y + (bounds.y - bounds.w)*1)); // 1
        tris.push(aPoints.length - 1);
        tris.push(aPoints.length - 2);
        tris.push(aPoints.length - 3);
        tris.push(aPoints.length - 1);
        tris.push(aPoints.length - 3);
        tris.push(aPoints.length - 4);

        // add in all the vers of the path
        for (var i = 0; i < aPoints.length - 4; i += 1)
        {
            var tri = cl.Triangulator.getSurroundingTri(aPoints, tris, aPoints[i]);

            if (tri !== -1)
            {
                var t1 = tris[tri];
                var t2 = tris[tri + 1];
                var t3 = tris[tri + 2];

                tris[tri] = t1;
                tris[tri+1] = t2;
                tris[tri+2] = i;

                tris.push(t2);
                tris.push(t3);
                tris.push(i);

                tris.push(t3);
                tris.push(t1);
                tris.push(i);

                cl.Triangulator.edgeFlip(aPoints, tris, tri);
                cl.Triangulator.edgeFlip(aPoints, tris, tris.length-3);
                cl.Triangulator.edgeFlip(aPoints, tris, tris.length-6);
            }
        }

        // hacky solution to the stack overflow on the recursive edge flipping I was getting
        for (var i = 0; i < tris.length*2; i+=3) {
            cl.Triangulator.edgeFlip(aPoints,tris, i%tris.length);
        }

        // remove the encompassing triangles
        if (!aInvert) {
            aPoints.splice(aPoints.length - 4, 4);
        }
        var result = [];
        var invertMesh = aInvert ? 0 : 1;
        for (var i=0;i<tris.length;i+=3) {
            if (aInvert || 
               (tris[i  ] < aPoints.length &&
                tris[i+1] < aPoints.length &&
                tris[i+2] < aPoints.length)) {

                var center = aPoints[tris[i]].add( aPoints[tris[i+1]] ).add( aPoints[tris[i+2]] ).divide(3);
                if (!aTreatAsPath || (cl.Triangulator.getSegmentsUnder(aPoints, center.x, center.y, aInvert).length/2) % 2 === invertMesh) {
                    if (cl.Triangulator.isClockwise(aPoints[tris[i]], aPoints[tris[i+1]], aPoints[tris[i+2]])) {
                        result.push(tris[i+2]);
                        result.push(tris[i+1]);
                        result.push(tris[i  ]);
                    } else {
                        result.push(tris[i  ]);
                        result.push(tris[i+1]);
                        result.push(tris[i+2]);
                    }
                }
            }
        }

        return result;
    };

    cl.Triangulator.getSegmentsUnder = function (aPath, aX, aY, aIgnoreLast) {
        var result = [];
        var off = aIgnoreLast ? 4 : 0;
        for (var i=0;i<aPath.length-off;i+=1) {
            var next = i+1 >= aPath.length-off ? 0 : i+1;
            var min = aPath[i].x < aPath[next].x ? i : next;
            var max = aPath[i].x > aPath[next].x ? i : next;

            if (aPath[min].x <= aX && aPath[max].x > aX) {
                var height = Math.lerp(aPath[min].y, aPath[max].y, (aX - aPath[min].x) / (aPath[max].x - aPath[min].x));
                if (aY > height) {
                    result.push(min);
                    result.push(max);
                }
            }
        }

        return result;
    };
    
    /// <summary>
    /// Gets a bounding rectangle based on the given points
    /// </summary>
    /// <param name="aPoints">List of points.</param>
    /// <returns>x = left, y = top, z = right, w = bottom</returns>
    cl.Triangulator.getBounds = function (aPoints) {
        if (aPoints.length <=0) {
            return {x:0, y:0, z:1, w:1};
        }
        
        var left   = aPoints[0].x;
        var right  = aPoints[0].x;
        var top    = aPoints[0].y;
        var bottom = aPoints[0].y;

        for (var i=0; i<aPoints.length; i+=1) {
            if (aPoints[i].x < left  ) { left   = aPoints[i].x; }
            if (aPoints[i].x > right ) { right  = aPoints[i].x; }
            if (aPoints[i].y > top   ) { top    = aPoints[i].y; }
            if (aPoints[i].y < bottom) { bottom = aPoints[i].y; }
        }
        return {x:left, y:top, z:right, w:bottom};
    };
    
    /// <summary>
    /// Is the given point inside a 2D triangle?
    /// </summary>
    /// <param name="aTri1">Triangle point 1</param>
    /// <param name="aTri2">Triangle point 2</param>
    /// <param name="aTri3">Triangle point 9001</param>
    /// <param name="aPt">The point to test!</param>
    /// <returns>IS IT INSIDE YET?</returns>
    cl.Triangulator.ptInTri = function (aTri1,  aTri2, aTri3, aPt) {
        var as_x = aPt.x - aTri1.x;
        var as_y = aPt.y - aTri1.y;
        var  s_ab = (aTri2.x - aTri1.x) * as_y - (aTri2.y - aTri1.y) * as_x > 0;

        if ((aTri3.x - aTri1.x) * as_y - (aTri3.y - aTri1.y) * as_x > 0 === s_ab) { return false; }
        if ((aTri3.x - aTri2.x) * (aPt.y - aTri2.y) - (aTri3.y - aTri2.y) * (aPt.x - aTri2.x) > 0 !== s_ab) { return false; }

        return true;
    };
    /// <summary>
    /// Gets the point where two lines intersect, really useful for determining the circumcenter.
    /// </summary>
    /// <param name="aStart1">Line 1 start</param>
    /// <param name="aEnd1">Line 1 llamma</param>
    /// <param name="aStart2">Line 2 start</param>
    /// <param name="aEnd2">Line 2 end</param>
    /// <returns>WHERE THEY INTERSECT</returns>
    cl.Triangulator.lineIntersectionPoint = function (aStart1, aEnd1, aStart2, aEnd2)
    {
        var A1 = aEnd1  .y - aStart1.y;
        var B1 = aStart1.x - aEnd1  .x;
        var C1 = A1 * aStart1.x + B1 * aStart1.y;

        var A2 = aEnd2  .y - aStart2.y;
        var B2 = aStart2.x - aEnd2  .x;
        var C2 = A2 * aStart2.x + B2 * aStart2.y;

        var delta = A1*B2 - A2*B1;

        return cl.p( (B2*C1 - B1*C2)/delta, (A1*C2 - A2*C1)/delta);
    };
    /// <summary>
    /// Determines if these points are in clockwise order.
    /// </summary>
    cl.Triangulator.isClockwise = function (aPt1, aPt2, aPt3) {
        return (aPt2.x - aPt1.x)*(aPt3.y - aPt1.y) - (aPt3.x - aPt1.x)*(aPt2.y - aPt1.y) > 0;
    };



    // private function

    cl.Triangulator.getCircumcenter = function (aPoints, aTris, aTri) {
        // find midpoints on two sides
        var midA = aPoints[aTris[aTri  ]].add(aPoints[aTris[aTri+1]]).divide(2);
        var midB = aPoints[aTris[aTri+1]].add(aPoints[aTris[aTri+2]]).divide(2);
        // get a perpendicular line for each midpoint
        var dirA = aPoints[aTris[aTri  ]].sub(aPoints[aTris[aTri+1]]); dirA = cl.p(dirA.y, -dirA.x);
        var dirB = aPoints[aTris[aTri+1]].sub(aPoints[aTris[aTri+2]]); dirB = cl.p(dirB.y, -dirB.x);
        // the intersection should give us the circumcenter
        return cl.Triangulator.lineIntersectionPoint(midA, midA.add(dirA), midB, midB.add(dirB));
    };

    cl.Triangulator.edgeFlip = function (aPoints, aTris, aTri) {
        var xyz      = [];
        var abc      = [];
        var shared   = [];
        var opposing = [];

        xyz.push ( aTris[aTri]   );
        xyz.push ( aTris[aTri+1] );
        xyz.push ( aTris[aTri+2] );
        var center = cl.Triangulator.getCircumcenter(aPoints, aTris, aTri);
        var distSq = cl.Point.sqrMagnitude(aPoints[xyz[0]].sub(center));

        for (var i = 0; i < aTris.length; i+=3) {
            if (i === aTri) { continue; }

            shared   = [];
            opposing = [];
            abc      = [];
            abc.push (aTris[i]);
            abc.push (aTris[i+1]);
            abc.push (aTris[i+2]);

            for (var triID1 = 0; triID1 < 3; triID1++) {
                var count = 0;
                for (var triID2 = 0; triID2 < 3; triID2++) {
                    if (xyz[triID1] === abc[triID2]) {
                        shared.push(xyz[triID1]);
                        count += 1;
                    }
                }
                if (count === 0) {
                    opposing.push (xyz[triID1]);
                }
            }
            if (opposing.length === 1 && shared.length === 2) {
                for (var triID1 = 0; triID1 < 3; triID1++) {
                    if (abc[triID1] !== shared[0] &&
                        abc[triID1] !== shared[1] &&
                        abc[triID1] !== opposing[0]) {
                        opposing.push (abc[triID1]);
                        break;
                    }
                }
            }

            if (opposing.length === 2 && shared.length === 2) {
                var sqr = cl.Point.sqrMagnitude(aPoints[opposing[1]].sub(center));
                // cc.log("sqr : %f   %f", sqr, distSq);
                if(sqr < distSq) {

                    aTris[aTri  ] = opposing[0];
                    aTris[aTri+1] = shared  [0];
                    aTris[aTri+2] = opposing[1];

                    aTris[i  ] = opposing[1];
                    aTris[i+1] = shared  [1];
                    aTris[i+2] = opposing[0];

                    //EdgeFlip(aPoints, aTris, aTri);
                    //EdgeFlip(aPoints, aTris, i);
                    return true;
                }
            }
        }
        return false;
    };

    cl.Triangulator.getSurroundingTri = function (aPoints, aTris, aPt) {
        for (var i=0; i<aTris.length; i+=3) {
            if (cl.Triangulator.ptInTri(aPoints[aTris[i]],
                        aPoints[aTris[i+1]],
                        aPoints[aTris[i+2]],
                        aPt )) {
                return i;
            }
        }
        return -1;
    };


})();
},{}]},{},["/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/cocoslite.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/Component.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/ComponentManager.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/animation/Spine.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/ColorComponent.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/MeshComponent.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/SpriteComponent.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/base/TransformComponent.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsBody.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsBox.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsPoly.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsSegment.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/PhysicsShape.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/component/physics/Separator.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/GameObject.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/core/SceneManager.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/object/MeshSprite.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/shortcode.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/EventDispatcher.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/KeyManager.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Serialization.js","/Users/youyou/Desktop/test/frameworks/cocos2d-html5/cocoslite/utils/Time.js","/Users/youyou/Desktop/test/src/CameraFollow.js","/Users/youyou/Desktop/test/src/Run.js","/Users/youyou/Desktop/test/src/terrain/DynamicMesh.js","/Users/youyou/Desktop/test/src/terrain/TerrainComponent.js","/Users/youyou/Desktop/test/src/terrain/TerrainMaterial.js","/Users/youyou/Desktop/test/src/terrain/TerrainPathComponent.js","/Users/youyou/Desktop/test/src/terrain/Triangulator.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvY29zbGl0ZS5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29tcG9uZW50L0NvbXBvbmVudC5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29tcG9uZW50L0NvbXBvbmVudE1hbmFnZXIuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9hbmltYXRpb24vU3BpbmUuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9iYXNlL0NvbG9yQ29tcG9uZW50LmpzIiwiZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvYmFzZS9NZXNoQ29tcG9uZW50LmpzIiwiZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvYmFzZS9TcHJpdGVDb21wb25lbnQuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9iYXNlL1RyYW5zZm9ybUNvbXBvbmVudC5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29tcG9uZW50L3BoeXNpY3MvUGh5c2ljc0JvZHkuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9waHlzaWNzL1BoeXNpY3NCb3guanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9waHlzaWNzL1BoeXNpY3NQb2x5LmpzIiwiZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvcGh5c2ljcy9QaHlzaWNzU2VnbWVudC5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29tcG9uZW50L3BoeXNpY3MvUGh5c2ljc1NoYXBlLmpzIiwiZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvcGh5c2ljcy9TZXBhcmF0b3IuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvcmUvR2FtZU9iamVjdC5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29yZS9TY2VuZU1hbmFnZXIuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL29iamVjdC9NZXNoU3ByaXRlLmpzIiwiZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9zaG9ydGNvZGUuanMiLCJmcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL3V0aWxzL0V2ZW50RGlzcGF0Y2hlci5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvdXRpbHMvS2V5TWFuYWdlci5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvdXRpbHMvU2VyaWFsaXphdGlvbi5qcyIsImZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvdXRpbHMvVGltZS5qcyIsInNyYy9DYW1lcmFGb2xsb3cuanMiLCJzcmMvUnVuLmpzIiwic3JjL3RlcnJhaW4vRHluYW1pY01lc2guanMiLCJzcmMvdGVycmFpbi9UZXJyYWluQ29tcG9uZW50LmpzIiwic3JjL3RlcnJhaW4vVGVycmFpbk1hdGVyaWFsLmpzIiwic3JjL3RlcnJhaW4vVGVycmFpblBhdGhDb21wb25lbnQuanMiLCJzcmMvdGVycmFpbi9Ucmlhbmd1bGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2wgPSBjbCA/IGNsIDoge307XG5cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyID0gZnVuY3Rpb24ob2JqLCBhdHRyLCBnZXR0ZXIsIHNldHRlcil7XG4gICAgICAgIGlmKHR5cGVvZiBhdHRyID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICAgICAvLyBkZWZpbmUgZ2V0dGVyXG4gICAgICAgICAgICBpZih0eXBlb2YgZ2V0dGVyID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgb2JqLl9fZGVmaW5lR2V0dGVyX18oYXR0ciwgZ2V0dGVyKTtcbiAgICAgICAgICAgIGVsc2UgaWYodHlwZW9mIGdldHRlciA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICBvYmouX19kZWZpbmVHZXR0ZXJfXyhhdHRyLCBvYmpbZ2V0dGVyXSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGRlZmluZSBzZXR0ZXJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBzZXR0ZXIgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICBvYmouX19kZWZpbmVTZXR0ZXJfXyhhdHRyLCBzZXR0ZXIpO1xuICAgICAgICAgICAgZWxzZSBpZih0eXBlb2Ygc2V0dGVyID09ICdzdHJpbmcnKSAgXG4gICAgICAgICAgICAgICAgb2JqLl9fZGVmaW5lU2V0dGVyX18oYXR0ciwgb2JqW3NldHRlcl0pO1xuXG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGZvcih2YXIgcCBpbiBhdHRyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cltwXTtcblxuICAgICAgICAgICAgICAgIGlmKHZhbHVlLnNldCkgXG4gICAgICAgICAgICAgICAgICAgIG9iai5fX2RlZmluZVNldHRlcl9fKHAsIHZhbHVlLnNldCk7XG4gICAgICAgICAgICAgICAgaWYodmFsdWUuZ2V0KSBcbiAgICAgICAgICAgICAgICAgICAgb2JqLl9fZGVmaW5lR2V0dGVyX18ocCwgdmFsdWUuZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsLmRlZmluZUdldHRlclNldHRlcihjYy5Ob2RlLnByb3RvdHlwZSwgXCJuYW1lXCIsIFwiZ2V0TmFtZVwiLCBcInNldE5hbWVcIik7XG5cbiAgICBjbC5jb25maWcgPSB7fTtcblxuICAgIGNsLnJlYWRDb25maWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2wuY29uZmlnID0ge307XG5cbiAgICAgICAgdmFyIHBhdGggPSBjYy5wYXRoLmpvaW4oY2MubG9hZGVyLnJlc1BhdGgsICdwcm9qZWN0Lmpzb24nKTtcblxuICAgICAgICBjYy5sb2FkZXIubG9hZEpzb24ocGF0aCwgZnVuY3Rpb24oZXJyLCBqc29uKXtcbiAgICAgICAgICAgIGlmKGVycikgdGhyb3cgZXJyO1xuXG4gICAgICAgICAgICBjbC5jb25maWdbJ3BoeXNpY3MnXSA9IGpzb25bJ3BoeXNpY3MnXSA/IGpzb25bJ3BoeXNpY3MnXSA6ICdOb25lJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG59KTtcblxuXG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgXG4gICAgdmFyIENvbXBvbmVudE1hbmFnZXIgPSByZXF1aXJlKFwiLi9Db21wb25lbnRNYW5hZ2VyLmpzXCIpO1xuXG4gICAgdmFyIGN0b3IgPSBmdW5jdGlvbihkZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfZGVwZW5kZW5jaWVzICAgID0gZGVwZW5kZW5jaWVzID8gZGVwZW5kZW5jaWVzIDogW107XG4gICAgICAgIHZhciBfdGFyZ2V0ICAgICAgICAgID0gbnVsbDtcbiAgICAgICAgdmFyIF9leHBvcnRlZE1ldGhvZHMgPSBudWxsO1xuICAgICAgICB2YXIgX2VudGVyZWQgICAgICAgICA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50ID0gZnVuY3Rpb24oY2xhc3NOYW1lKXtcbiAgICAgICAgICAgIGlmKF90YXJnZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIF90YXJnZXQuYWRkQ29tcG9uZW50KGNsYXNzTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XG4gICAgICAgICAgICBpZihfdGFyZ2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiBfdGFyZ2V0LmdldENvbXBvbmVudChjbGFzc05hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGhpcy5fYmluZCA9IGZ1bmN0aW9uKHRhcmdldCl7XG4gICAgICAgICAgICBfdGFyZ2V0ID0gdGFyZ2V0O1xuXG4gICAgICAgICAgICBmb3IodmFyIGsgaW4gX2RlcGVuZGVuY2llcyl7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoX2RlcGVuZGVuY2llc1trXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25CaW5kKHRhcmdldCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fdW5iaW5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKF9leHBvcnRlZE1ldGhvZHMgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGhvZHMgPSBfZXhwb3J0ZWRNZXRob2RzO1xuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gbWV0aG9kcyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXRob2QgPSBtZXRob2RzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIF90YXJnZXRbbWV0aG9kXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uVW5iaW5kKF90YXJnZXQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2VudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZihfZW50ZXJlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2VudGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5vbkVudGVyKF90YXJnZXQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2V4cG9ydE1ldGhvZHMgPSBmdW5jdGlvbiAobWV0aG9kcykge1xuXG4gICAgICAgICAgICBfZXhwb3J0ZWRNZXRob2RzID0gbWV0aG9kcztcblxuICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gbWV0aG9kcyl7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGhvZCA9IG1ldGhvZHNba2V5XTtcbiAgICAgICAgICAgICAgICBfdGFyZ2V0W21ldGhvZF0gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmW21ldGhvZF0uYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNsLmRlZmluZUdldHRlclNldHRlcih0aGlzLCB7XG4gICAgICAgICAgICBcInRhcmdldFwiOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90YXJnZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gY2MuQ2xhc3MuZXh0ZW5kKHtcbiAgICAgICAgcHJvcGVydGllczogW10sXG4gICAgICAgIFxuICAgICAgICBjdG9yOmN0b3IsXG4gICAgICAgIFxuICAgICAgICBvbkJpbmQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuXG4gICAgICAgIH0sXG4gICAgICAgIG9uVW5iaW5kOiBmdW5jdGlvbih0YXJnZXQpIHtcblxuICAgICAgICB9LFxuICAgICAgICBvbkVudGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcblxuICAgICAgICB9XG4gICAgfSk7XG5cblxuXG4gICAgQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudCA9IGZ1bmN0aW9uKGNsYXNzTmFtZSwgcGFyYW1zLCBwYXJlbnQpIHtcbiAgICAgICAgaWYoIXBhcmVudCkgcGFyZW50ID0gQ29tcG9uZW50O1xuXG4gICAgICAgIHZhciBncyA9IHBhcmFtcy5fZ2V0X3NldF87XG4gICAgICAgIGRlbGV0ZSBwYXJhbXMuX2dldF9zZXRfO1xuXG4gICAgICAgIHZhciBfZm9sZGVyXyA9IHBhcmFtcy5fZm9sZGVyXyA/IHBhcmFtcy5fZm9sZGVyXyA6IHBhcmVudC5fZm9sZGVyXztcbiAgICAgICAgZGVsZXRlIHBhcmFtcy5fZm9sZGVyXztcblxuICAgICAgICB2YXIgYWJzdHJhY3QgPSBwYXJhbXMuX2Fic3RyYWN0XztcbiAgICAgICAgZGVsZXRlIHBhcmFtcy5fYWJzdHJhY3RfO1xuXG4gICAgICAgIHZhciBfc2hvd18gPSBwYXJhbXMuX3Nob3dfID8gcGFyYW1zLl9zaG93XyA6IHBhcmVudC5fc2hvd187XG4gICAgICAgIGRlbGV0ZSBwYXJhbXMuX3Nob3dfO1xuXG4gICAgICAgIHZhciByZXQgPSBwYXJlbnQuZXh0ZW5kKHBhcmFtcyk7XG5cbiAgICAgICAgaWYoZ3MpIHtcbiAgICAgICAgICAgIGNsLmRlZmluZUdldHRlclNldHRlcihyZXQucHJvdG90eXBlLCBncyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXQucHJvdG90eXBlLmNsYXNzTmFtZSA9IHJldC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgICAgIHJldC5fZm9sZGVyXyA9IF9mb2xkZXJfO1xuICAgICAgICByZXQuX3Nob3dfID0gX3Nob3dfO1xuXG4gICAgICAgIGlmKCFhYnN0cmFjdCkge1xuICAgICAgICAgICAgQ29tcG9uZW50TWFuYWdlci5yZWdpc3RlcihjbGFzc05hbWUsIHJldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIENvbXBvbmVudC5pbml0ID0gZnVuY3Rpb24ob2JqLCBwYXJhbXMpIHtcbiAgICAgICAgZm9yKHZhciBrIGluIHBhcmFtcykge1xuICAgICAgICAgICAgb2JqW2tdID0gcGFyYW1zW2tdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbC5Db21wb25lbnQgPSBDb21wb25lbnQ7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICB2YXIgQ29tcG9uZW50TWFuYWdlciA9IGNjLkNsYXNzLmV4dGVuZCh7XG4gICAgICAgIGN0b3IgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaXN0ZXIgOiBmdW5jdGlvbihjbGFzc05hbWUsIGNscyl7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzW2NsYXNzTmFtZV0gPSBjbHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5yZWdpc3RlciA6IGZ1bmN0aW9uKGNsYXNzTmFtZSl7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fY2xhc3Nlc1tjbGFzc05hbWVdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZSA6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBjbHMgPSB0aGlzLl9jbGFzc2VzW2NsYXNzTmFtZV07XG5cbiAgICAgICAgICAgIGlmKGNscyAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY2xzKGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEFsbENsYXNzZXM6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xhc3NlcztcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGFzc2VzID0gW107XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gY2wuQ29tcG9uZW50TWFuYWdlciA9IG5ldyBDb21wb25lbnRNYW5hZ2VyO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgXG4gICAgdmFyIENvbXBvbmVudCAgICA9IHJlcXVpcmUoXCIuLi9Db21wb25lbnQuanNcIik7XG5cbiAgICB2YXIgU3BpbmUgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiU3BpbmVcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBbXCJmaWxlXCIsIFwiYW5pbWF0aW9uXCJdLFxuXG4gICAgICAgIGN0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fZmlsZSAgICAgID0gXCJcIjsgXG4gICAgICAgICAgICB0aGlzLl9hbmltYXRpb24gPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5fc3BpbmUgICAgID0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICBcbiAgICAgICAgb25CaW5kOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuX3NwaW5lKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFkZENoaWxkKHRoaXMuX3NwaW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRNaXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYodGhpcy5fc3BpbmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zcGluZS5zZXRNaXguYXBwbHkodGhpcy5fc3BpbmUsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3VwZGF0ZVNwaW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuX3NwaW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3BpbmUucmVtb3ZlRnJvbVBhcmVudCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIganNvbiAgPSB0aGlzLl9maWxlO1xuICAgICAgICAgICAgdmFyIGF0bGFzID0gdGhpcy5fZmlsZS5yZXBsYWNlKCcuanNvbicsICcnKSArICcuYXRsYXMnO1xuXG4gICAgICAgICAgICB0aGlzLl9zcGluZSA9IG5ldyBzcC5Ta2VsZXRvbkFuaW1hdGlvbihqc29uLCBhdGxhcyk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuX3NwaW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuYWRkQ2hpbGQodGhpcy5fc3BpbmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUFuaW1hdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF91cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuX3NwaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLl9hbmltYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zcGluZS5zZXRBbmltYXRpb24oMCwgdGhpcy5fYW5pbWF0aW9uLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0X3NldF86IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX2ZpbGUgPT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsZSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU3BpbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYW5pbWF0aW9uO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5fYW5pbWF0aW9uID09PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbiA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlQW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2xkZXJfOiBcImFuaW1hdGlvblwiXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNwaW5lO1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoXCIuLi9Db21wb25lbnQuanNcIik7XG5cbiAgICB2YXIgQ29sb3JDb21wb25lbnQgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiQ29sb3JDb21wb25lbnRcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBbXCJjb2xvclwiLCBcImNhc2NhZGVDb2xvclwiLCBcIm9wYWNpdHlcIiwgXCJjYXNjYWRlT3BhY2l0eVwiXSxcblxuICAgICAgICBjdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldF9zZXRfOiB7XG4gICAgICAgICAgICBcImNvbG9yXCI6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYy5jb2xvcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5jb2xvcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LmNvbG9yID0gdmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwiY2FzY2FkZUNvbG9yXCI6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQuY2FzY2FkZUNvbG9yO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuY2FzY2FkZUNvbG9yID0gdmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQub3BhY2l0eTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9wYWNpdHkgPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgXCJjYXNjYWRlT3BhY2l0eVwiOiB7XG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuY2FzY2FkZU9wYWNpdHkgPSB2YWw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQuY2FzY2FkZU9wYWNpdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2xkZXJfOiBcImJhc2VcIlxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDb2xvckNvbXBvbmVudDtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIFxuICAgIHZhciBDb21wb25lbnQgPSByZXF1aXJlKFwiLi4vQ29tcG9uZW50LmpzXCIpO1xuXG4gICAgdmFyIE1lc2hDb21wb25lbnQgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiTWVzaENvbXBvbmVudFwiLCB7XG4gICAgICAgIC8vIHByb3BlcnRpZXM6IFtcIm1hdGVyaWFsc1wiXSxcbiAgICAgICAgLy8gc2VyaWFsaXphdGlvbjogW1wic3ViTWVzaGVzXCIsIFwidmVydGljZXNcIl0sXG5cbiAgICAgICAgY3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLl9pbm5lck1lc2ggPSBuZXcgY2wuTWVzaFNwcml0ZSgpO1xuICAgICAgICAgICAgdGhpcy5faW5uZXJNZXNoLnJldGFpbigpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRNYXRlcmlhbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lubmVyTWVzaC5tYXRlcmlhbHM7XG4gICAgICAgIH0sXG4gICAgICAgIF9zZXRNYXRlcmlhbHM6IGZ1bmN0aW9uKG1hdGVyaWFscykge1xuICAgICAgICAgICAgdGhpcy5faW5uZXJNZXNoLm1hdGVyaWFscyA9IG1hdGVyaWFscztcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTdWJNZXNoOiBmdW5jdGlvbihpbmRleCwgaW5kaWNlcykge1xuICAgICAgICAgICAgdGhpcy5faW5uZXJNZXNoLnNldFN1Yk1lc2goaW5kZXgsIGluZGljZXMpO1xuICAgICAgICB9LFxuICAgICAgICBfZ2V0U3ViTWVzaGVzOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lubmVyTWVzaC5zdWJNZXNoZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldFZlcnRpY2VzOiBmdW5jdGlvbih2ZXJ0aWNlcykge1xuICAgICAgICAgICAgdGhpcy5faW5uZXJNZXNoLnZlcnRpY2VzID0gdmVydGljZXM7XG4gICAgICAgIH0sXG4gICAgICAgIF9nZXRWZXJ0aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5uZXJNZXNoLnZlcnRpY2VzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYmluZFZlcnRpY2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbm5lck1lc2gucmViaW5kVmVydGljZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaXRUZXN0OiBmdW5jdGlvbih3b3JsZFBvaW50KSB7XG4gICAgICAgICAgICBpZighdGhpcy5faW5uZXJNZXNoIHx8ICF3b3JsZFBvaW50KSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5faW5uZXJNZXNoLmNvbnZlcnRUb05vZGVTcGFjZSh3b3JsZFBvaW50KTtcbiAgICAgICAgICAgIHAgPSBjYy5wKHApO1xuXG4gICAgICAgICAgICB2YXIgdmVydGljZXMgPSB0aGlzLnZlcnRpY2VzO1xuICAgICAgICAgICAgdmFyIHN1Yk1lc2hlcyA9IHRoaXMuc3ViTWVzaGVzO1xuXG4gICAgICAgICAgICBmb3IodmFyIGk9MDsgaTxzdWJNZXNoZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHZhciBpbmRpY2VzID0gc3ViTWVzaGVzW2ldO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaj0wOyBqPGluZGljZXMubGVuZ3RoOyBqKz0zKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGEgPSBjYy5wKHZlcnRpY2VzW2luZGljZXNbaiAgXV0udmVydGljZXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IGNjLnAodmVydGljZXNbaW5kaWNlc1tqKzFdXS52ZXJ0aWNlcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjID0gY2MucCh2ZXJ0aWNlc1tpbmRpY2VzW2orMl1dLnZlcnRpY2VzKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihhLmVxdWFsKGIpICYmIGIuZXF1YWwoYykpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZihwLmluVHJpYW5nbGUoYSxiLGMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CaW5kOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRDaGlsZCh0aGlzLl9pbm5lck1lc2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2xkZXJfOiBcImJhc2VcIlxuICAgIH0pO1xuXG4gICAgdmFyIF9wID0gTWVzaENvbXBvbmVudC5wcm90b3R5cGU7XG4gICAgTWVzaENvbXBvbmVudC5lZGl0b3JEaXIgPSBcIk1lc2hcIjtcblxuICAgIGNsLmRlZmluZUdldHRlclNldHRlcihfcCwgXCJtYXRlcmlhbHNcIiwgXCJfZ2V0TWF0ZXJpYWxzXCIsIFwiX3NldE1hdGVyaWFsc1wiKTtcbiAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwidmVydGljZXNcIiwgXCJfZ2V0VmVydGljZXNcIiwgXCJfc2V0VmVydGljZXNcIik7XG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcInN1Yk1lc2hlc1wiLCBcIl9nZXRTdWJNZXNoZXNcIik7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IE1lc2hDb21wb25lbnQ7XG59KTtcblxuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIFxuICAgIHZhciBDb21wb25lbnQgPSByZXF1aXJlKFwiLi4vQ29tcG9uZW50LmpzXCIpO1xuXG4gICAgdmFyIFNwcml0ZUNvbXBvbmVudCA9IENvbXBvbmVudC5leHRlbmRDb21wb25lbnQoXCJTcHJpdGVDb21wb25lbnRcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBbXCJzcHJpdGVcIiwgXCJhbmNob3JQb2ludFwiXSxcbiAgICAgICAgXG4gICAgICAgIGN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fYW5jaG9yUG9pbnQgPSBuZXcgY2wucCgwLjUsIDAuNSk7XG4gICAgICAgICAgICB0aGlzLl9pbm5lclNwcml0ZSA9IG5ldyBjYy5TcHJpdGUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfc2V0U3ByaXRlOiBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICBpZihmaWxlICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5uZXJTcHJpdGUuaW5pdFdpdGhGaWxlKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbm5lclNwcml0ZS5zZXRUZXh0dXJlKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfZ2V0U3ByaXRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lubmVyU3ByaXRlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRBbmNob3JQb2ludDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JQb2ludDtcbiAgICAgICAgfSxcbiAgICAgICAgX3NldEFuY2hvclBvaW50OiBmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgdGhpcy5fYW5jaG9yUG9pbnQgPSBjbC5wKHZhbCk7XG4gICAgICAgICAgICB0aGlzLl9pbm5lclNwcml0ZS5zZXRBbmNob3JQb2ludCh2YWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRCb3VuZGluZ0JveDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbm5lclNwcml0ZS5nZXRCb3VuZGluZ0JveFRvV29ybGQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkJpbmQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZENoaWxkKHRoaXMuX2lubmVyU3ByaXRlKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25VbmJpbmQ6IGZ1bmN0aW9uKHRhcmdldCl7XG4gICAgICAgICAgICB0YXJnZXQucmVtb3ZlQ2hpbGQodGhpcy5faW5uZXJTcHJpdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpdFRlc3Q6IGZ1bmN0aW9uKHdvcmxkUG9pbnQpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lubmVyU3ByaXRlIHx8ICF3b3JsZFBvaW50KSByZXR1cm47XG5cbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5faW5uZXJTcHJpdGUuY29udmVydFRvTm9kZVNwYWNlKHdvcmxkUG9pbnQpO1xuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLl9pbm5lclNwcml0ZS5nZXRDb250ZW50U2l6ZSgpO1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBjYy5yZWN0KDAsIDAsIHMud2lkdGgsIHMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgcmV0dXJuIGNjLnJlY3RDb250YWluc1BvaW50KHJlY3QsIHApO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2xkZXJfOiBcImJhc2VcIlxuICAgIH0pO1xuXG4gICAgdmFyIF9wID0gU3ByaXRlQ29tcG9uZW50LnByb3RvdHlwZTtcbiAgICBTcHJpdGVDb21wb25lbnQuZWRpdG9yRGlyID0gXCJTcHJpdGVcIjtcblxuICAgIGNsLmRlZmluZUdldHRlclNldHRlcihfcCwgXCJzcHJpdGVcIiwgXCJfZ2V0U3ByaXRlXCIsIFwiX3NldFNwcml0ZVwiKTtcbiAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwiYW5jaG9yUG9pbnRcIiwgXCJfZ2V0QW5jaG9yUG9pbnRcIiwgXCJfc2V0QW5jaG9yUG9pbnRcIik7XG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcImJvdW5kaW5nQm94XCIsIFwiX2dldEJvdW5kaW5nQm94XCIsIG51bGwpO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVDb21wb25lbnQ7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICB2YXIgQ29tcG9uZW50ID0gcmVxdWlyZShcIi4uL0NvbXBvbmVudC5qc1wiKTtcblxuICAgIHZhciBUcmFuc2Zvcm1Db21wb25lbnQgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiVHJhbnNmb3JtQ29tcG9uZW50XCIsIHtcbiAgICAgICAgcHJvcGVydGllczogW1wicG9zaXRpb25cIiwgXCJzY2FsZVwiLCBcInJvdGF0aW9uXCJdLFxuICAgICAgICBcbiAgICAgICAgY3RvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRfc2V0Xzoge1xuICAgICAgICAgICAgXCJwb3NpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2wucCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc2V0UG9zaXRpb24odmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBcInNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjbC5wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsLnAodGhpcy50YXJnZXQuc2NhbGVYLCB0aGlzLnRhcmdldC5zY2FsZVkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwsIHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc2NhbGVYID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc2NhbGVZID0geTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnNjYWxlWCA9IHZhbC54O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuc2NhbGVZID0gdmFsLnk7XG4gICAgICAgICAgICAgICAgICAgIH0gIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwicm90YXRpb25cIjoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsLnAoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2wucCh0aGlzLnRhcmdldC5yb3RhdGlvblgsIHRoaXMudGFyZ2V0LnJvdGF0aW9uWSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCwgeSkge1xuICAgICAgICAgICAgICAgICAgICBpZih5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yb3RhdGlvblggPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yb3RhdGlvblkgPSB5O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodmFsLnggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucm90YXRpb25YID0gdmFsLng7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yb3RhdGlvblkgPSB2YWwueTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJvdGF0aW9uID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgXCJ4XCI6IHtcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gY2wucCh2YWwsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQueDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBcInlcIjoge1xuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSBjbC5wKHRoaXMucG9zaXRpb24ueCwgdmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC55O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwic2NhbGVYXCI6IHtcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYWxlID0gY2wucCh2YWwsIHRoaXMuc2NhbGUueSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQuc2NhbGVYO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwic2NhbGVZXCI6IHtcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYWxlID0gY2wucCh0aGlzLnNjYWxlLngsIHZhbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQuc2NhbGVZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIFwicm90YXRpb25YXCI6IHtcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gY2wucCh2YWwsIHRoaXMucm90YXRpb24ueSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJvdGF0aW9uWCA9IHZhbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yb3RhdGlvblg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgXCJyb3RhdGlvbllcIjoge1xuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSBjbC5wKHRoaXMucm90YXRpb24ueCwgdmFsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yb3RhdGlvblk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9mb2xkZXJfOiBcImJhc2VcIlxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm1Db21wb25lbnQ7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICB2YXIgQ29tcG9uZW50ICAgICAgID0gcmVxdWlyZShcIi4uL0NvbXBvbmVudC5qc1wiKTtcblxuICAgIHZhciBQaHlzaWNzQm9keSA9IENvbXBvbmVudC5leHRlbmRDb21wb25lbnQoXCJQaHlzaWNzQm9keVwiLCB7XG4gICAgICAgIHByb3BlcnRpZXM6IFsnc3RhdGljJywgJ21lc3MnLCAnbW9tZW50J10sXG5cbiAgICAgICAgY3RvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0aWMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX21lc3MgPSAxO1xuICAgICAgICAgICAgdGhpcy5fbW9tZW50ID0gMTAwMDtcbiAgICAgICAgICAgIHRoaXMuX2R1cmluZ1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEJvZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2JvZHk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25FbnRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICBpZih0aGlzLl9zdGF0aWMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ib2R5ID0gY2wuc3BhY2Uuc3RhdGljQm9keTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYm9keSA9IG5ldyBjcC5Cb2R5KHRoaXMuX21lc3MsIHRoaXMuX21vbWVudCApO1xuICAgICAgICAgICAgICAgIGNsLnNwYWNlLmFkZEJvZHkoIHRoaXMuX2JvZHkgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRWZWwgPSB0aGlzLl9ib2R5LnNldFZlbC5iaW5kKHRoaXMuX2JvZHkpO1xuICAgICAgICAgICAgdGhpcy5nZXRWZWwgPSB0aGlzLl9ib2R5LmdldFZlbC5iaW5kKHRoaXMuX2JvZHkpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMudCA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiVHJhbnNmb3JtQ29tcG9uZW50XCIpO1xuXG4gICAgICAgICAgICB0YXJnZXQuX29yaWdpblNldFBvc2l0aW9uID0gdGFyZ2V0LnNldFBvc2l0aW9uO1xuICAgICAgICAgICAgdGFyZ2V0LnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpblNldFBvc2l0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICBpZihzZWxmLl9kdXJpbmdVcGRhdGUgfHwgIXNlbGYuX2JvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYm9keS5zZXRQb3MoeCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYm9keS5zZXRQb3MoY2wucCh4LCB5KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQuX29yaWdpblNldFJvdGF0aW9uID0gdGFyZ2V0LnNldFJvdGF0aW9uO1xuICAgICAgICAgICAgdGFyZ2V0LnNldFJvdGF0aW9uID0gZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpblNldFJvdGF0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICBpZihzZWxmLl9kdXJpbmdVcGRhdGUgfHwgIXNlbGYuX2JvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX2JvZHkuYSA9IC1jYy5kZWdyZWVzVG9SYWRpYW5zKHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIodGFyZ2V0LCBcInBvc2l0aW9uXCIsIHRhcmdldC5nZXRQb3NpdGlvbiwgdGFyZ2V0LnNldFBvc2l0aW9uKTtcbiAgICAgICAgICAgIGNsLmRlZmluZUdldHRlclNldHRlcih0YXJnZXQsIFwicm90YXRpb25cIiwgdGFyZ2V0LmdldFJvdGF0aW9uLCB0YXJnZXQuc2V0Um90YXRpb24pO1xuXG4gICAgICAgICAgICB0YXJnZXQucG9zaXRpb24gPSB0YXJnZXQucG9zaXRpb247XG4gICAgICAgICAgICB0YXJnZXQucm90YXRpb24gPSB0YXJnZXQucm90YXRpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N5bmNQb3NpdGlvbjpmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMuX2JvZHkuZ2V0UG9zKCk7XG4gICAgICAgICAgICB2YXIgbG9jUG9zaXRpb24gPSB0aGlzLnQucG9zaXRpb247XG5cbiAgICAgICAgICAgIGlmIChsb2NQb3NpdGlvbi54ICE9PSBwLnggfHwgbG9jUG9zaXRpb24ueSAhPT0gcC55KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50LnBvc2l0aW9uID0gY2wucChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX3N5bmNSb3RhdGlvbjpmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYSA9IC1jYy5yYWRpYW5zVG9EZWdyZWVzKHRoaXMuX2JvZHkuZ2V0QW5nbGUoKSk7XG4gICAgICAgICAgICBpZiAodGhpcy50LnJvdGF0aW9uWCAhPT0gYSkge1xuICAgICAgICAgICAgICAgIHRoaXMudC5yb3RhdGlvbiA9IGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uKGR0KSB7XG4gICAgICAgICAgICBpZih0aGlzLl9zdGF0aWMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2R1cmluZ1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX3N5bmNQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5fc3luY1JvdGF0aW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2R1cmluZ1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRfc2V0Xzoge1xuICAgICAgICAgICAgJ3N0YXRpYyc6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGljO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0aWMgPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ21lc3MnOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21lc3M7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21lc3MgPSB2YWwgPyB2YWwgOiBJbmZpbml0eTtcblxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLl9ib2R5ICYmIHRoaXMuX3N0YXRpYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYm9keS5zZXRNZXNzKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAnbW9tZW50Jzoge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb21lbnQ7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vbWVudCA9IHZhbCA/IHZhbCA6IEluZmluaXR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX2JvZHkgJiYgdGhpcy5fc3RhdGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ib2R5LnNldE1vbWVudCh2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zaG93XzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY2wuY29uZmlnLnBoeXNpY3MgPT09ICdjaGlwbXVuayc7XG4gICAgICAgIH0sXG4gICAgICAgIF9mb2xkZXJfOiBcInBoeXNpY3NcIlxuICAgIH0pO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQaHlzaWNzQm9keTtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIFxuICAgIHZhciBDb21wb25lbnQgICAgPSByZXF1aXJlKFwiLi4vQ29tcG9uZW50LmpzXCIpO1xuICAgIHZhciBQaHlzaWNzU2hhcGUgPSByZXF1aXJlKFwiLi9QaHlzaWNzU2hhcGUuanNcIik7XG5cblxuICAgIHZhciBQaHlzaWNzQm94ID0gQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudChcIlBoeXNpY3NCb3hcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBQaHlzaWNzU2hhcGUucHJvdG90eXBlLnByb3BlcnRpZXMuY29uY2F0KFsnd2lkdGgnLCAnaGVpZ2h0JywgJ2FuY2hvciddKSxcbiAgICAgICAgXG4gICAgICAgIGN0b3I6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLndpZHRoICA9IDUwO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSA1MDtcbiAgICAgICAgICAgIHRoaXMuX2FuY2hvciA9IGNsLnAoMC41LCAwLjUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVZlcnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcy5nZXRDb21wb25lbnQoJ1RyYW5zZm9ybUNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICB2YXIgYXggPSB0aGlzLmFuY2hvci54LCBheSA9IHRoaXMuYW5jaG9yLnk7XG4gICAgICAgICAgICB2YXIgdyAgPSB0aGlzLndpZHRoLCAgICBoICA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHN4ID0gdC5zY2FsZVgsICAgICAgc3kgPSB0LnNjYWxlWTtcblxuICAgICAgICAgICAgdmFyIGh3ID0gdGhpcy53aWR0aCAgKiB0aGlzLmFuY2hvci54ICogdC5zY2FsZVg7XG4gICAgICAgICAgICB2YXIgaGggPSB0aGlzLmhlaWdodCAqIHRoaXMuYW5jaG9yLnkgKiB0LnNjYWxlWTtcblxuICAgICAgICAgICAgdmFyIGwgPSAtdyAqIHN4ICogYXg7XG4gICAgICAgICAgICB2YXIgciA9ICB3ICogc3ggKiAoMS1heCk7XG4gICAgICAgICAgICB2YXIgYiA9IC1oICogc3kgKiBheTtcbiAgICAgICAgICAgIHZhciB0ID0gIGggKiBzeSAqICgxLWF5KTtcblxuICAgICAgICAgICAgdmFyIHZlcnRzID0gW1xuICAgICAgICAgICAgICAgIGwsIGIsXG4gICAgICAgICAgICAgICAgbCwgdCxcbiAgICAgICAgICAgICAgICByLCB0LFxuICAgICAgICAgICAgICAgIHIsIGJcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHJldHVybiB2ZXJ0cztcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTaGFwZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNwLlBvbHlTaGFwZSh0aGlzLmdldEJvZHkoKSwgdGhpcy5jcmVhdGVWZXJ0cygpLCBjcC52emVybyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dldF9zZXRfOiB7XG4gICAgICAgICAgICBhbmNob3I6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYW5jaG9yO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5jaG9yID0gY2wucCh2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFBoeXNpY3NTaGFwZSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBoeXNpY3NCb3g7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICB2YXIgQ29tcG9uZW50ICAgID0gcmVxdWlyZShcIi4uL0NvbXBvbmVudC5qc1wiKTtcbiAgICB2YXIgUGh5c2ljc1NoYXBlID0gcmVxdWlyZShcIi4vUGh5c2ljc1NoYXBlLmpzXCIpO1xuICAgIHZhciBTZXBhcmF0b3IgID0gcmVxdWlyZShcIi4vU2VwYXJhdG9yLmpzXCIpO1xuXG5cblxuXG4gICAgdmFyIFBoeXNpY3NQb2x5ID0gQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudChcIlBoeXNpY3NQb2x5XCIsIHtcbiAgICAgICAgc2VyaWFsaXphdGlvbjogWyd2ZXJ0cyddLFxuXG4gICAgICAgIGN0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdmVydHMgPSBbY2wucCgtMjUsIC0yNSksIGNsLnAoIC0yNSwgMjUpLCBjbC5wKDI1LCAyNSksIGNsLnAoMjUsIC0yNSldO1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVTaGFwZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdmVydHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpLCBqO1xuICAgICAgICAgICAgdmFyIHBvbHk7XG5cbiAgICAgICAgICAgIHZhciBzaGFwZXMgPSBbXTtcblxuICAgICAgICAgICAgdmFyIHJldCA9IFNlcGFyYXRvci52YWxpZGF0ZSh2ZXJ0cyk7XG4gICAgICAgICAgICBpZihyZXQgPT09IDApIHtcblxuICAgICAgICAgICAgICAgIHZhciBib2R5ICAgPSB0aGlzLmdldEJvZHkoKTtcblxuICAgICAgICAgICAgICAgIHZhciBzY2FsZVggPSB0aGlzLnRhcmdldC5zY2FsZVg7XG4gICAgICAgICAgICAgICAgdmFyIHNjYWxlWSA9IHRoaXMudGFyZ2V0LnNjYWxlWTtcblxuICAgICAgICAgICAgICAgIC8vIHJldmVyc2UgdmVydHNcbiAgICAgICAgICAgICAgICB2YXIgdGVtcCAgID0gdGhpcy5fdmVydHMucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgIHZhciBwb2x5cyAgPSBTZXBhcmF0b3IuY2FsY1NoYXBlcyh0ZW1wKTtcblxuICAgICAgICAgICAgICAgIGZvcihpPTA7IGk8cG9seXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHBvbHkgID0gcG9seXNbaV0ucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihqPTA7IGo8cG9seS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVydHMucHVzaCggcG9seVtqXS54ICogc2NhbGVYICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0cy5wdXNoKCBwb2x5W2pdLnkgKiBzY2FsZVkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlcy5wdXNoKG5ldyBjcC5Qb2x5U2hhcGUoYm9keSwgdmVydHMsIGNwLnZ6ZXJvKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGNyZWF0ZSBjb252ZXggcG9seWdvbiA6IFwiLCByZXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2hhcGVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRfc2V0Xzoge1xuICAgICAgICAgICAgdmVydHM6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmVydHM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZlcnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRzLnNwbGljZSgwLCB0aGlzLl92ZXJ0cy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpPHZlcnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRzLnB1c2goY2wucCh2ZXJ0c1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgUGh5c2ljc1NoYXBlKTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gUGh5c2ljc1BvbHk7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICB2YXIgQ29tcG9uZW50ICAgID0gcmVxdWlyZShcIi4uL0NvbXBvbmVudC5qc1wiKTtcbiAgICB2YXIgUGh5c2ljc1NoYXBlID0gcmVxdWlyZShcIi4vUGh5c2ljc1NoYXBlLmpzXCIpO1xuXG5cbiAgICB2YXIgUGh5c2ljc1NlZ21lbnQgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiUGh5c2ljc1NlZ21lbnRcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBQaHlzaWNzU2hhcGUucHJvdG90eXBlLnByb3BlcnRpZXMuY29uY2F0KFsnc3RhcnQnLCAnZW5kJ10pLFxuXG4gICAgICAgIGN0b3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fc3RhcnQgPSBjbC5wKDAsICAwKTtcbiAgICAgICAgICAgIHRoaXMuX2VuZCAgID0gY2wucCgxMDAsMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU2hhcGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBjcC5TZWdtZW50U2hhcGUodGhpcy5nZXRCb2R5KCksIHRoaXMuX3N0YXJ0LCB0aGlzLl9lbmQsIDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRfc2V0Xzoge1xuICAgICAgICAgICAgc3RhcnQ6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGFydCA9IGNsLnAodmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5kO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5kID0gY2wucCh2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFBoeXNpY3NTaGFwZSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBoeXNpY3NTZWdtZW50O1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoXCIuLi9Db21wb25lbnQuanNcIik7XG5cbiAgICB2YXIgUGh5c2ljc1NoYXBlID0gQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudChcIlBoeXNpY3NTaGFwZVwiLCB7XG4gICAgICAgIHByb3BlcnRpZXM6IFsnc2Vuc29yJywgJ2VsYXN0aWNpdHknLCAnZnJpY3Rpb24nXSxcblxuICAgICAgICBjdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyKFsnUGh5c2ljc0JvZHknXSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NoYXBlcyAgICAgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3NlbnNvciAgICAgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2VsYXN0aWNpdHkgPSAwO1xuICAgICAgICAgICAgdGhpcy5fZnJpY3Rpb24gICA9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Qm9keTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGh5c2ljc0JvZHkuZ2V0Qm9keSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNoYXBlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2hhcGVzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZVNoYXBlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVNoYXBlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLl9waHlzaWNzQm9keSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc2hhcGVzLmZvckVhY2goZnVuY3Rpb24oc2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjbC5zcGFjZS5yZW1vdmVTaGFwZShzaGFwZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fc2hhcGVzID0gdGhpcy5jcmVhdGVTaGFwZSgpO1xuICAgICAgICAgICAgaWYoIUFycmF5LmlzQXJyYXkodGhpcy5fc2hhcGVzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NoYXBlcyA9IFt0aGlzLl9zaGFwZXNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLl9zaGFwZXMuZm9yRWFjaChmdW5jdGlvbihzaGFwZSkge1xuICAgICAgICAgICAgICAgIGNsLnNwYWNlLmFkZFNoYXBlKHNoYXBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRW50ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy5fcGh5c2ljc0JvZHkgPSB0aGlzLmdldENvbXBvbmVudCgnUGh5c2ljc0JvZHknKTtcblxuICAgICAgICAgICAgdGhpcy51cGRhdGVTaGFwZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRfc2V0Xzoge1xuICAgICAgICAgICAgc2Vuc29yOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbnNvcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbnNvciA9IHZhbDtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaGFwZXMuZm9yRWFjaChmdW5jdGlvbihzaGFwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGUuc2V0U2Vuc29yKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGVsYXN0aWNpdHk6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZWxhc3RpY2l0eTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsYXN0aWNpdHkgPSB2YWw7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hhcGVzLmZvckVhY2goZnVuY3Rpb24oc2hhcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlLnNldEVsYXN0aWNpdHkodmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZnJpY3Rpb246IHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZnJpY3Rpb247XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mcmljdGlvbiA9IHZhbDtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaGFwZXMuZm9yRWFjaChmdW5jdGlvbihzaGFwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGUuc2V0RnJpY3Rpb24odmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zaG93XzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gY2wuY29uZmlnLnBoeXNpY3MgPT09ICdjaGlwbXVuayc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2ZvbGRlcl86IFwicGh5c2ljc1wiLFxuICAgICAgICBfYWJzdHJhY3RfOiB0cnVlXG4gICAgfSk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBoeXNpY3NTaGFwZTtcbn0pO1xuIiwiKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGZ1bmN0aW9uIGIyVmVjMih4LCB5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgdmVydGljZXMgaW4gPGNvZGU+dmVydGljZXNBcnJheTwvY29kZT4gY2FuIGJlIHByb3Blcmx5IGRpc3RyaWJ1dGVkIGludG8gdGhlIG5ldyBmaXh0dXJlcyAobW9yZSBzcGVjaWZpY2FsbHksIGl0IG1ha2VzIHN1cmUgdGhlcmUgYXJlIG5vIG92ZXJsYXBwaW5nIHNlZ21lbnRzIGFuZCB0aGUgdmVydGljZXMgYXJlIGluIGNsb2Nrd2lzZSBvcmRlcikuIFxuICAgKiBJdCBpcyByZWNvbW1lbmRlZCB0aGF0IHlvdSB1c2UgdGhpcyBtZXRob2QgZm9yIGRlYnVnZ2luZyBvbmx5LCBiZWNhdXNlIGl0IG1heSBjb3N0IG1vcmUgQ1BVIHVzYWdlLlxuICAgKiA8cC8+XG4gICAqIEBwYXJhbSB2ZXJ0aWNlc0FycmF5IFRoZSB2ZXJ0aWNlcyB0byBiZSB2YWxpZGF0ZWQuXG4gICAqIEByZXR1cm4gQW4gaW50ZWdlciB3aGljaCBjYW4gaGF2ZSB0aGUgZm9sbG93aW5nIHZhbHVlczpcbiAgICogPHVsPlxuICAgKiA8bGk+MCBpZiB0aGUgdmVydGljZXMgY2FuIGJlIHByb3Blcmx5IHByb2Nlc3NlZC48L2xpPlxuICAgKiA8bGk+MSBJZiB0aGVyZSBhcmUgb3ZlcmxhcHBpbmcgbGluZXMuPC9saT5cbiAgICogPGxpPjIgaWYgdGhlIHBvaW50cyBhcmUgPGI+bm90PC9iPiBpbiBjbG9ja3dpc2Ugb3JkZXIuPC9saT5cbiAgICogPGxpPjMgaWYgdGhlcmUgYXJlIG92ZXJsYXBwaW5nIGxpbmVzIDxiPmFuZDwvYj4gdGhlIHBvaW50cyBhcmUgPGI+bm90PC9iPiBpbiBjbG9ja3dpc2Ugb3JkZXIuPC9saT5cbiAgICogPC91bD4gXG4gICAqICovXG4gICAgdmFyIHZhbGlkYXRlID0gZnVuY3Rpb24odmVydGljZXNBcnJheSkge1xuICAgICAgICB2YXIgaSwgbiA9IHZlcnRpY2VzQXJyYXkubGVuZ3RoLFxuICAgICAgICBqLCBqMiwgaTIsIGkzLCBkLCByZXQgPSAwO1xuICAgICAgICB2YXIgZmwsIGZsMiA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGkyID0gKGkgPCBuIC0gMSkgPyBpICsgMSA6IDA7XG4gICAgICAgICAgICBpMyA9IChpID4gMCkgPyBpIC0gMSA6IG4gLSAxO1xuXG4gICAgICAgICAgICBmbCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IG47IGorKykge1xuICAgICAgICAgICAgICAgIGlmICgoKGogIT0gaSkgJiYgaiAhPSBpMikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGRldCh2ZXJ0aWNlc0FycmF5W2ldLngsIHZlcnRpY2VzQXJyYXlbaV0ueSwgdmVydGljZXNBcnJheVtpMl0ueCwgdmVydGljZXNBcnJheVtpMl0ueSwgdmVydGljZXNBcnJheVtqXS54LCB2ZXJ0aWNlc0FycmF5W2pdLnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChkID4gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoKGogIT0gaTMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqMiA9IChqIDwgbiAtIDEpID8gaiArIDEgOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhpdFNlZ21lbnQodmVydGljZXNBcnJheVtpXS54LCB2ZXJ0aWNlc0FycmF5W2ldLnksIHZlcnRpY2VzQXJyYXlbaTJdLngsIHZlcnRpY2VzQXJyYXlbaTJdLnksIHZlcnRpY2VzQXJyYXlbal0ueCwgdmVydGljZXNBcnJheVtqXS55LCB2ZXJ0aWNlc0FycmF5W2oyXS54LCB2ZXJ0aWNlc0FycmF5W2oyXS55KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZmwpIHtcbiAgICAgICAgICAgICAgICBmbDIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZsMikge1xuICAgICAgICAgICAgaWYgKChyZXQgPT0gMSkpIHtcbiAgICAgICAgICAgICAgICByZXQgPSAzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXQgPSAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjU2hhcGVzKHZlcnRpY2VzQXJyYXkpIHtcbiAgICAgICAgdmFyIHZlYztcbiAgICAgICAgdmFyIGksIG4sIGo7XG4gICAgICAgIHZhciBkLCB0LCBkeCwgZHksIG1pbkxlbjtcbiAgICAgICAgdmFyIGkxLCBpMiwgaTMsIHAxLCBwMiwgcDM7XG4gICAgICAgIHZhciBqMSwgajIsIHYxLCB2MiwgaywgaDtcbiAgICAgICAgdmFyIHZlYzEsIHZlYzI7XG4gICAgICAgIHZhciB2LCBoaXRWO1xuICAgICAgICB2YXIgaXNDb252ZXg7XG4gICAgICAgIHZhciBmaWdzVmVjID0gW10sXG4gICAgICAgIHF1ZXVlID0gW107XG5cbiAgICAgICAgcXVldWUucHVzaCh2ZXJ0aWNlc0FycmF5KTtcblxuICAgICAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB2ZWMgPSBxdWV1ZVswXTtcbiAgICAgICAgICAgIG4gPSB2ZWMubGVuZ3RoO1xuICAgICAgICAgICAgaXNDb252ZXggPSB0cnVlO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaTEgPSBpO1xuICAgICAgICAgICAgICAgIGkyID0gKGkgPCBuIC0gMSkgPyBpICsgMSA6IGkgKyAxIC0gbjtcbiAgICAgICAgICAgICAgICBpMyA9IChpIDwgbiAtIDIpID8gaSArIDIgOiBpICsgMiAtIG47XG5cbiAgICAgICAgICAgICAgICBwMSA9IHZlY1tpMV07XG4gICAgICAgICAgICAgICAgcDIgPSB2ZWNbaTJdO1xuICAgICAgICAgICAgICAgIHAzID0gdmVjW2kzXTtcblxuICAgICAgICAgICAgICAgIGQgPSBkZXQocDEueCwgcDEueSwgcDIueCwgcDIueSwgcDMueCwgcDMueSk7XG4gICAgICAgICAgICAgICAgaWYgKChkIDwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNDb252ZXggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKChqICE9IGkxKSAmJiBqICE9IGkyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGoxID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqMiA9IChqIDwgbiAtIDEpID8gaiArIDEgOiAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdjEgPSB2ZWNbajFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYyID0gdmVjW2oyXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBoaXRSYXkocDEueCwgcDEueSwgcDIueCwgcDIueSwgdjEueCwgdjEueSwgdjIueCwgdjIueSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IHAyLnggLSB2Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gcDIueSAtIHYueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdCA9IGR4ICogZHggKyBkeSAqIGR5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgodCA8IG1pbkxlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGggPSBqMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBqMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpdFYgPSB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluTGVuID0gdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICgobWluTGVuID09IE51bWJlci5NQVhfVkFMVUUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZlYzEgPSBuZXcgQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzIgPSBuZXcgQXJyYXk7XG5cbiAgICAgICAgICAgICAgICAgICAgajEgPSBoO1xuICAgICAgICAgICAgICAgICAgICBqMiA9IGs7XG4gICAgICAgICAgICAgICAgICAgIHYxID0gdmVjW2oxXTtcbiAgICAgICAgICAgICAgICAgICAgdjIgPSB2ZWNbajJdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcG9pbnRzTWF0Y2goaGl0Vi54LCBoaXRWLnksIHYyLngsIHYyLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMxLnB1c2goaGl0Vik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwb2ludHNNYXRjaChoaXRWLngsIGhpdFYueSwgdjEueCwgdjEueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIucHVzaChoaXRWKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgayA9IGkxO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChrICE9IGoyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlYzEucHVzaCh2ZWNba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKChoIDwgMCkgfHwgaCA+PSBuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc09uU2VnbWVudCh2Mi54LCB2Mi55LCB2ZWNbaF0ueCwgdmVjW2hdLnksIHAxLngsIHAxLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlYzEucHVzaCh2ZWNba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaCA9IGs7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKChrIC0gMSkgPCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBuIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgay0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmVjMSA9IHZlYzEucmV2ZXJzZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgayA9IGkyO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChrICE9IGoxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIucHVzaCh2ZWNba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKChoIDwgMCkgfHwgaCA+PSBuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCgoayA9PSBqMSkgJiYgIWlzT25TZWdtZW50KHYxLngsIHYxLnksIHZlY1toXS54LCB2ZWNbaF0ueSwgcDIueCwgcDIueSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIucHVzaCh2ZWNba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaCA9IGs7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKChrICsgMSkgPiBuIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaCh2ZWMxLCB2ZWMyKTtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0NvbnZleCkge1xuICAgICAgICAgICAgICAgIGZpZ3NWZWMucHVzaChxdWV1ZS5zaGlmdCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWdzVmVjO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpdFJheSh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpIHtcbiAgICAgICAgdmFyIHQxID0geDMgLSB4MSxcbiAgICAgICAgdDIgPSB5MyAtIHkxLFxuICAgICAgICB0MyA9IHgyIC0geDEsXG4gICAgICAgIHQ0ID0geTIgLSB5MSxcbiAgICAgICAgdDUgPSB4NCAtIHgzLFxuICAgICAgICB0NiA9IHk0IC0geTMsXG4gICAgICAgIHQ3ID0gdDQgKiB0NSAtIHQzICogdDYsXG4gICAgICAgIGE7XG5cbiAgICAgICAgYSA9ICgoKHQ1ICogdDIpIC0gdDYgKiB0MSkgLyB0Nyk7XG4gICAgICAgIHZhciBweCA9IHgxICsgYSAqIHQzLFxuICAgICAgICBweSA9IHkxICsgYSAqIHQ0O1xuICAgICAgICB2YXIgYjEgPSBpc09uU2VnbWVudCh4MiwgeTIsIHgxLCB5MSwgcHgsIHB5KTtcbiAgICAgICAgdmFyIGIyID0gaXNPblNlZ21lbnQocHgsIHB5LCB4MywgeTMsIHg0LCB5NCk7XG5cbiAgICAgICAgaWYgKChiMSAmJiBiMikpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgYjJWZWMyKHB4LCBweSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoaXRTZWdtZW50KHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkge1xuICAgICAgICB2YXIgdDEgPSB4MyAtIHgxLFxuICAgICAgICB0MiA9IHkzIC0geTEsXG4gICAgICAgIHQzID0geDIgLSB4MSxcbiAgICAgICAgdDQgPSB5MiAtIHkxLFxuICAgICAgICB0NSA9IHg0IC0geDMsXG4gICAgICAgIHQ2ID0geTQgLSB5MyxcbiAgICAgICAgdDcgPSB0NCAqIHQ1IC0gdDMgKiB0NixcbiAgICAgICAgYTtcblxuICAgICAgICBhID0gKCgodDUgKiB0MikgLSB0NiAqIHQxKSAvIHQ3KTtcbiAgICAgICAgdmFyIHB4ID0geDEgKyBhICogdDMsXG4gICAgICAgIHB5ID0geTEgKyBhICogdDQ7XG4gICAgICAgIHZhciBiMSA9IGlzT25TZWdtZW50KHB4LCBweSwgeDEsIHkxLCB4MiwgeTIpO1xuICAgICAgICB2YXIgYjIgPSBpc09uU2VnbWVudChweCwgcHksIHgzLCB5MywgeDQsIHk0KTtcblxuICAgICAgICBpZiAoKGIxICYmIGIyKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBiMlZlYzIocHgsIHB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzT25TZWdtZW50KHB4LCBweSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgdmFyIGIxID0gKCgoKHgxICsgMC4xKSA+PSBweCkgJiYgcHggPj0geDIgLSAwLjEpIHx8ICgoKHgxIC0gMC4xKSA8PSBweCkgJiYgcHggPD0geDIgKyAwLjEpKTtcbiAgICAgICAgdmFyIGIyID0gKCgoKHkxICsgMC4xKSA+PSBweSkgJiYgcHkgPj0geTIgLSAwLjEpIHx8ICgoKHkxIC0gMC4xKSA8PSBweSkgJiYgcHkgPD0geTIgKyAwLjEpKTtcbiAgICAgICAgcmV0dXJuICgoYjEgJiYgYjIpICYmIGlzT25MaW5lKHB4LCBweSwgeDEsIHkxLCB4MiwgeTIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludHNNYXRjaCh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICB2YXIgZHggPSAoeDIgPj0geDEpID8geDIgLSB4MTogeDEgLSB4MixcbiAgICAgICAgZHkgPSAoeTIgPj0geTEpID8geTIgLSB5MTogeTEgLSB5MjtcbiAgICAgICAgcmV0dXJuICgoZHggPCAwLjEpICYmIGR5IDwgMC4xKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc09uTGluZShweCwgcHksIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIGlmICgoKCh4MiAtIHgxKSA+IDAuMSkgfHwgeDEgLSB4MiA+IDAuMSkpIHtcbiAgICAgICAgICAgIHZhciBhID0gKHkyIC0geTEpIC8gKHgyIC0geDEpLFxuICAgICAgICAgICAgcG9zc2libGVZID0gYSAqIChweCAtIHgxKSArIHkxLFxuICAgICAgICAgICAgZGlmZiA9IChwb3NzaWJsZVkgPiBweSkgPyBwb3NzaWJsZVkgLSBweTogcHkgLSBwb3NzaWJsZVk7XG4gICAgICAgICAgICByZXR1cm4gKGRpZmYgPCAwLjEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgoKHB4IC0geDEpIDwgMC4xKSB8fCB4MSAtIHB4IDwgMC4xKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXQoeDEsIHkxLCB4MiwgeTIsIHgzLCB5Mykge1xuICAgICAgICByZXR1cm4geDEgKiB5MiArIHgyICogeTMgKyB4MyAqIHkxIC0geTEgKiB4MiAtIHkyICogeDMgLSB5MyAqIHgxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQSBwcm9ibGVtIGhhcyBvY2N1cnJlZC4gVXNlIHRoZSBWYWxpZGF0ZSgpIG1ldGhvZCB0byBzZWUgd2hlcmUgdGhlIHByb2JsZW0gaXMuXCIpO1xuICAgIH1cblxuICAgIGV4cG9ydHMuY2FsY1NoYXBlcyA9IGNhbGNTaGFwZXM7XG4gICAgZXhwb3J0cy52YWxpZGF0ZSA9IHZhbGlkYXRlO1xufSk7IiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoXCIuLi9jb21wb25lbnQvQ29tcG9uZW50LmpzXCIpO1xuXG4gICAgdmFyIEdhbWVPYmplY3QgPSBjYy5Ob2RlLmV4dGVuZCh7XG4gICAgICAgIHByb3BlcnRpZXM6IFtcIm5hbWVcIiwgXCJ0YWdcIl0sXG5cbiAgICAgICAgY3RvciA6IGZ1bmN0aW9uICgpe1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcblxuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fcHJvcGVydGllcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUmVxdWVzdCA9IDA7XG5cbiAgICAgICAgICAgIHRoaXMubmFtZSA9IFwiR2FtZU9iamVjdFwiO1xuXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChcIlRyYW5zZm9ybUNvbXBvbmVudFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuXG4gICAgICAgIF9nZXRDb21wb25lbnRzOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkQ29tcG9uZW50IDogZnVuY3Rpb24oY2xhc3NOYW1lKXtcbiAgICAgICAgICAgIHZhciBjO1xuXG4gICAgICAgICAgICBpZih0eXBlb2YgY2xhc3NOYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGMgPSB0aGlzLl9jb21wb25lbnRzW2NsYXNzTmFtZV07XG4gICAgICAgICAgICAgICAgaWYoYykgcmV0dXJuIGM7XG5cbiAgICAgICAgICAgICAgICBjID0gY2wuQ29tcG9uZW50TWFuYWdlci5jcmVhdGUoY2xhc3NOYW1lKTtcbiAgICAgICAgICAgICAgICBpZihjID09IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjbGFzc05hbWUgKyBcImlzIG5vdCBhIHZhbGlkIENvbXBvbmVudFwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50c1tjbGFzc05hbWVdID0gYztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgY2xhc3NOYW1lID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYyA9IGNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzW2MuY2xhc3NOYW1lXSA9IGM7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgYy5fYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudHMucHVzaChjKTtcblxuICAgICAgICAgICAgaWYoYy5vblVwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuX3VwZGF0ZVJlcXVlc3QgPT09IDAgJiYgdGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVJlcXVlc3QrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgIGMuX2VudGVyKHRoaXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDb21wb25lbnRzIDogZnVuY3Rpb24oY2xhc3NuYW1lcyl7XG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiBjbGFzc25hbWVzKXtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENvbXBvZW50KGNsYXNzbmFtZXNba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29tcG9uZW50OiBmdW5jdGlvbihjbGFzc05hbWUpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHNbY2xhc3NOYW1lXTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVDb21wb25lbnQ6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBjbGFzc05hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lLmNsYXNzTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl9jb21wb25lbnRzW2NsYXNzTmFtZV07XG5cbiAgICAgICAgICAgIGlmKGMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGMuX3VuYmluZCgpO1xuXG4gICAgICAgICAgICAgICAgaWYoYy5vblVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0LS07XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX3VwZGF0ZVJlcXVlc3QgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fY29tcG9uZW50c1tjbGFzc05hbWVdO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2NvbXBvbmVudHMuaW5kZXhPZihjKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2MuTm9kZS5wcm90b3R5cGUub25FbnRlci5jYWxsKHRoaXMpO1xuXG4gICAgICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9jb21wb25lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzW2ldLl9lbnRlcih0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodGhpcy5fdXBkYXRlUmVxdWVzdCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlVXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkdCkge1xuICAgICAgICAgICAgaWYoIXRoaXMuaXNSdW5uaW5nKCkpIHJldHVybjtcblxuICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gdGhpcy5fY29tcG9uZW50cyl7XG4gICAgICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl9jb21wb25lbnRzW2tleV07XG4gICAgICAgICAgICAgICAgaWYoYy5vblVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjLm9uVXBkYXRlKGR0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGl0VGVzdDogZnVuY3Rpb24od29ybGRQb2ludCl7XG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiB0aGlzLl9jb21wb25lbnRzKXtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IHRoaXMuX2NvbXBvbmVudHNba2V5XTtcbiAgICAgICAgICAgICAgICBpZihjLmhpdFRlc3QgIT0gbnVsbCAmJiBjLmhpdFRlc3Qod29ybGRQb2ludCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSB0aGlzLnRvSlNPTigpO1xuICAgICAgICAgICAgcmV0dXJuIEdhbWVPYmplY3QuZnJvbUpTT04oanNvbik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNsLmRlZmluZUdldHRlclNldHRlcihHYW1lT2JqZWN0LnByb3RvdHlwZSwgXCJjb21wb25lbnRzXCIsIFwiX2dldENvbXBvbmVudHNcIik7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsLkdhbWVPYmplY3QgPSBHYW1lT2JqZWN0O1xufSk7XG4iLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgR2FtZU9iamVjdCA9IHJlcXVpcmUoXCIuL0dhbWVPYmplY3QuanNcIik7XG5cbiAgICAvLyBwcml2YXRlXG4gICAgdmFyIF9zY2VuZU1hcCA9IHt9O1xuXG4gICAgLy8gU2NlbmVNYW5hZ2VyXG4gICAgdmFyIFNjZW5lTWFuYWdlciA9IHt9O1xuXG5cblxuICAgIFNjZW5lTWFuYWdlci5sb2FkU2NlbmUgPSBmdW5jdGlvbihwYXRoLCBjYiwgZm9yY2UpIHtcbiAgICAgICAgdmFyIGpzb24gPSBfc2NlbmVNYXBbcGF0aF07XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB2YXIgcGFyc2VDb21wbGV0ZSA9IGZ1bmN0aW9uKHNjZW5lKXtcbiAgICAgICAgICAgIGlmKHNjZW5lICYmIGNiKSBjYihzY2VuZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihqc29uICYmICFmb3JjZSl7XG4gICAgICAgICAgICBwYXJzZURhdGEoanNvbiwgcGFyc2VDb21wbGV0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYy5sb2FkZXIubG9hZEpzb24ocGF0aCwgZnVuY3Rpb24oZXJyLCBqc29uKXtcbiAgICAgICAgICAgICAgICBpZihlcnIpIHRocm93IGVycjtcblxuICAgICAgICAgICAgICAgIF9zY2VuZU1hcFtwYXRoXSA9IGpzb247XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2VsZi5wYXJzZURhdGEoanNvbiwgcGFyc2VDb21wbGV0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTY2VuZU1hbmFnZXIubG9hZFNjZW5lV2l0aENvbnRlbnQgPSBmdW5jdGlvbihjb250ZW50LCBjYikge1xuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZShjb250ZW50KTsgXG5cbiAgICAgICAgICAgIHZhciBwYXJzZUNvbXBsZXRlID0gZnVuY3Rpb24oc2NlbmUpe1xuICAgICAgICAgICAgICAgIGlmKHNjZW5lICYmIGNiKSBjYihzY2VuZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucGFyc2VEYXRhKGpzb24sIHBhcnNlQ29tcGxldGUpOyAgIFxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG5cbiAgICBTY2VuZU1hbmFnZXIuaW5pdFBoeXNpY3MgPSBmdW5jdGlvbihzY2VuZSwgZGF0YSkge1xuICAgICAgICBzY2VuZS5waHlzaWNzID0gZGF0YTtcbiAgICAgICAgc2NlbmUuc3BhY2UgPSBjbC5zcGFjZSA9IG5ldyBjcC5TcGFjZSgpO1xuXG4gICAgICAgIHZhciBzcGFjZSA9IGNsLnNwYWNlIDtcblxuICAgICAgICAvLyBHcmF2aXR5XG4gICAgICAgIHNwYWNlLmdyYXZpdHkgPSBjcC52KDAsIC03MDApO1xuXG5cbiAgICAgICAgdmFyIGRlYnVnTm9kZSA9IG5ldyBjYy5QaHlzaWNzRGVidWdOb2RlKCBzcGFjZSApO1xuICAgICAgICBkZWJ1Z05vZGUudmlzaWJsZSA9IHRydWUgO1xuXG4gICAgICAgIHZhciBwYXJlbnQgPSBzY2VuZTtcbiAgICAgICAgaWYoc2NlbmUuY2FudmFzKSB7XG4gICAgICAgICAgICBwYXJlbnQgPSBzY2VuZS5jYW52YXM7XG4gICAgICAgIH1cbiAgICAgICAgcGFyZW50LmFkZENoaWxkKCBkZWJ1Z05vZGUsIDEwMDAwICk7XG5cbiAgICAgICAgc2NlbmUuYWRkVXBkYXRlRnVuYyhjbC5zcGFjZS5zdGVwLmJpbmQoY2wuc3BhY2UpKTtcbiAgICB9XG5cbiAgICBTY2VuZU1hbmFnZXIucGFyc2VEYXRhID0gZnVuY3Rpb24oanNvbiwgY2Ipe1xuICAgICAgICB2YXIgZGF0YSA9IGpzb24ucm9vdDtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQoZGF0YS5yZXMsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIHNjZW5lID0gbmV3IGNjLlNjZW5lKCk7XG4gICAgICAgICAgICBzZWxmLmluaXRTY2VuZShzY2VuZSk7XG5cbiAgICAgICAgICAgIHNjZW5lLnJlcyA9IGRhdGEucmVzO1xuXG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gc2NlbmU7XG4gICAgICAgICAgICBpZihjbC5jcmVhdGVDYW52YXMpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBjbC5jcmVhdGVDYW52YXMoc2NlbmUsIGRhdGEuY2FudmFzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoY2wuY29uZmlnLnBoeXNpY3MgIT09ICdOb25lJykge1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdFBoeXNpY3Moc2NlbmUsIGRhdGEucGh5c2ljcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpPGRhdGEuY2hpbGRyZW4ubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHZhciBvID0gR2FtZU9iamVjdC5mcm9tSlNPTihkYXRhLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgICAgICBwYXJlbnQuYWRkQ2hpbGQobyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGNiKSB7XG4gICAgICAgICAgICAgICAgY2Ioc2NlbmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH07XG5cbiAgICBTY2VuZU1hbmFnZXIuaW5pdFNjZW5lID0gZnVuY3Rpb24oc2NlbmUpIHtcblxuICAgICAgICB2YXIgdXBkYXRlTGlzdCA9IFtdO1xuXG4gICAgICAgIHNjZW5lLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gICAgICAgICAgICBmb3IodmFyIGk9MDsgaTx1cGRhdGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlTGlzdFtpXShkdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzY2VuZS5hZGRVcGRhdGVGdW5jID0gZnVuY3Rpb24oZnVuYykge1xuICAgICAgICAgICAgdXBkYXRlTGlzdC5wdXNoKGZ1bmMpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NlbmUuc2NoZWR1bGVVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsLlNjZW5lTWFuYWdlciA9IFNjZW5lTWFuYWdlcjtcbn0pO1xuIiwidmFyIFRleHR1cmVBcnJheSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgYXJyYXkuX3B1c2ggPSBhcnJheS5wdXNoO1xuICAgIGFycmF5LnB1c2ggPSBmdW5jdGlvbihmaWxlKXtcbiAgICAgICAgaWYoZmlsZSl7XG4gICAgICAgICAgICBpZihjYy5pc1N0cmluZyhmaWxlKSl7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBjYy50ZXh0dXJlQ2FjaGUuYWRkSW1hZ2UoZmlsZSk7XG4gICAgICAgICAgICAgICAgaXRlbS5maWxlID0gZmlsZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wdXNoKGl0ZW0pOyAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHVzaChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFycmF5LnNldCA9IGZ1bmN0aW9uKGluZGV4LCBmaWxlKXtcbiAgICAgICAgaWYoZmlsZSl7XG4gICAgICAgICAgICBpZihjYy5pc1N0cmluZyhmaWxlKSl7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBjYy50ZXh0dXJlQ2FjaGUuYWRkSW1hZ2UoZmlsZSk7XG4gICAgICAgICAgICAgICAgaXRlbS5maWxlID0gZmlsZTtcbiAgICAgICAgICAgICAgICB0aGlzW2luZGV4XSA9IGl0ZW07ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzW2luZGV4XSA9IGZpbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG59XG5cbmNsLk1lc2hTcHJpdGUgPSBjYy5Ob2RlLmV4dGVuZCh7XG4gICAgX2J1ZmZlckNhcGFjaXR5OiAwLFxuICAgIF9idWZmZXI6IG51bGwsXG5cbiAgICAvLzA6IHZlcnRleCAgMTogaW5kaWNlc1xuICAgIF9idWZmZXJzVkJPOiBudWxsLFxuXG4gICAgX3RyaWFuZ2xlc0FycmF5QnVmZmVyOiBudWxsLFxuICAgIF90cmlhbmdsZXNXZWJCdWZmZXI6IG51bGwsXG4gICAgX3RyaWFuZ2xlc1JlYWRlcjogbnVsbCxcblxuICAgIF9ibGVuZEZ1bmM6IG51bGwsXG4gICAgX2RpcnR5OiBmYWxzZSxcblxuICAgIF9tYXRlcmlhbHM6IG51bGwsXG5cbiAgICBfc3ViTWVzaGVzOiBudWxsLFxuXG4gICAgX2NsYXNzTmFtZTogXCJNZXNoU3ByaXRlXCIsXG5cbiAgICBjdG9yOiBmdW5jdGlvbigpe1xuICAgICAgICBjYy5Ob2RlLnByb3RvdHlwZS5jdG9yLmNhbGwodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9idWZmZXIgICAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWxzICAgID0gVGV4dHVyZUFycmF5KCk7XG4gICAgICAgIHRoaXMuX3N1Yk1lc2hlcyAgICA9IFtdO1xuICAgICAgICB0aGlzLl9idWZmZXJzVkJPICAgPSBbXTtcblxuICAgICAgICB2YXIgbG9jQ21kICAgICAgICAgPSB0aGlzLl9yZW5kZXJDbWQ7XG4gICAgICAgIHRoaXMuX2JsZW5kRnVuYyAgICA9IG5ldyBjYy5CbGVuZEZ1bmMoY2MuQkxFTkRfU1JDLCBjYy5CTEVORF9EU1QpO1xuXG4gICAgICAgIHRoaXMuc2hhZGVyUHJvZ3JhbSA9IGNjLnNoYWRlckNhY2hlLnByb2dyYW1Gb3JLZXkoY2MuU0hBREVSX1BPU0lUSU9OX1RFWFRVUkVDT0xPUik7XG4gICAgfSxcblxuICAgIHNldFN1Yk1lc2g6IGZ1bmN0aW9uKGluZGV4LCBpbmRpY2VzKXtcbiAgICAgICAgdGhpcy5fc3ViTWVzaGVzW2luZGV4XSA9IG5ldyBVaW50MTZBcnJheShpbmRpY2VzKTtcbiAgICB9LFxuXG4gICAgX2dldFN1Yk1lc2hlczogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1Yk1lc2hlcztcbiAgICB9LFxuXG4gICAgX3NldFZlcnRpY2VzOiBmdW5jdGlvbih2ZXJ0aWNlcyl7XG4gICAgICAgIHZhciBWZXJ0ZXhMZW5ndGggPSBjYy5WM0ZfQzRCX1QyRi5CWVRFU19QRVJfRUxFTUVOVDtcblxuICAgICAgICB0aGlzLl9idWZmZXIuc3BsaWNlKDAsIHRoaXMuX2J1ZmZlci5sZW5ndGgpO1xuXG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlc0FycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKFZlcnRleExlbmd0aCAqIHZlcnRpY2VzLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlc1JlYWRlciA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3RyaWFuZ2xlc0FycmF5QnVmZmVyKTtcblxuICAgICAgICBmb3IodmFyIGk9MDsgaTx2ZXJ0aWNlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB2YXIgdiA9IHZlcnRpY2VzW2ldO1xuICAgICAgICAgICAgdmFyIG52ID0gbmV3IGNjLlYzRl9DNEJfVDJGKHYuX3ZlcnRpY2VzLCB2Ll9jb2xvcnMsIHYuX3RleENvb3JkcywgdGhpcy5fdHJpYW5nbGVzQXJyYXlCdWZmZXIsIGkqVmVydGV4TGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlci5wdXNoKG52KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX2dldFZlcnRpY2VzOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyO1xuICAgIH0sXG5cbiAgICBfZ2V0TWF0ZXJpYWxzOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fbWF0ZXJpYWxzO1xuICAgIH0sXG4gICAgX3NldE1hdGVyaWFsczogZnVuY3Rpb24obWF0ZXJpYWxzKXtcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWxzLnNwbGljZSgwLCB0aGlzLl9tYXRlcmlhbHMubGVuZ3RoKTtcbiAgICAgICAgXG4gICAgICAgIGZvcih2YXIgaSBpbiBtYXRlcmlhbHMpe1xuICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWxzLnB1c2gobWF0ZXJpYWxzW2ldKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZWJpbmRWZXJ0aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldHVwVkJPKCk7XG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgX3NldHVwVkJPOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBnbCA9IGNjLl9yZW5kZXJDb250ZXh0O1xuICAgICAgICAvL2NyZWF0ZSBXZWJHTEJ1ZmZlclxuICAgICAgICB0aGlzLl9idWZmZXJzVkJPWzBdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIC8vIHRoaXMuX2J1ZmZlcnNWQk9bMV0gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5fYnVmZmVyc1ZCT1sxXSA9IFtdO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9zdWJNZXNoZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgdGhpcy5fYnVmZmVyc1ZCT1sxXVtpXSA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzV2ViQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuX21hcEJ1ZmZlcnMoKTtcbiAgICB9LFxuXG4gICAgX21hcEJ1ZmZlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGdsID0gY2MuX3JlbmRlckNvbnRleHQ7XG5cbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuX3RyaWFuZ2xlc1dlYkJ1ZmZlcik7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLl90cmlhbmdsZXNBcnJheUJ1ZmZlciwgZ2wuRFlOQU1JQ19EUkFXKTtcblxuICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9zdWJNZXNoZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5fYnVmZmVyc1ZCT1sxXVtpXSk7XG4gICAgICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLl9zdWJNZXNoZXNbaV0sIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLl9idWZmZXJzVkJPWzFdKTtcbiAgICAgICAgLy8gZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5faW5kaWNlcywgZ2wuU1RBVElDX0RSQVcpO1xuICAgIH0sXG5cbiAgICAvLyBnZXRCbGVuZEZ1bmM6IGZ1bmN0aW9uICgpIHtcbiAvLyAgICAgICAgcmV0dXJuIHRoaXMuX2JsZW5kRnVuYztcbiAvLyAgICB9LFxuXG4gLy8gICAgc2V0QmxlbmRGdW5jOiBmdW5jdGlvbiAoYmxlbmRGdW5jLCBkc3QpIHtcbiAvLyAgICAgICAgaWYgKGRzdCA9PT0gdW5kZWZpbmVkKSB7XG4gLy8gICAgICAgICAgICB0aGlzLl9ibGVuZEZ1bmMuc3JjID0gYmxlbmRGdW5jLnNyYztcbiAvLyAgICAgICAgICAgIHRoaXMuX2JsZW5kRnVuYy5kc3QgPSBibGVuZEZ1bmMuZHN0O1xuIC8vICAgICAgICB9IGVsc2Uge1xuIC8vICAgICAgICAgICAgdGhpcy5fYmxlbmRGdW5jLnNyYyA9IGJsZW5kRnVuYztcbiAvLyAgICAgICAgICAgIHRoaXMuX2JsZW5kRnVuYy5kc3QgPSBkc3Q7XG4gLy8gICAgICAgIH1cbiAvLyAgICB9LFxuXG4gICAgLy8gc2V0VGV4dHVyZTogZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICAvLyAgICAgdmFyIF90ID0gdGhpcztcbiAgICAvLyAgICAgaWYodGV4dHVyZSAmJiAoY2MuaXNTdHJpbmcodGV4dHVyZSkpKXtcbiAgICAvLyAgICAgICAgIHRleHR1cmUgPSBjYy50ZXh0dXJlQ2FjaGUuYWRkSW1hZ2UodGV4dHVyZSk7XG4gICAgLy8gICAgICAgICBfdC5zZXRUZXh0dXJlKHRleHR1cmUpO1xuICAgIC8vICAgICAgICAgLy9UT0RPXG4gICAgLy8gICAgICAgICAvLyB2YXIgc2l6ZSA9IHRleHR1cmUuZ2V0Q29udGVudFNpemUoKTtcbiAgICAvLyAgICAgICAgIC8vIF90LnNldFRleHR1cmVSZWN0KGNjLnJlY3QoMCwwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCkpO1xuICAgIC8vICAgICAgICAgLy9JZiBpbWFnZSBpc24ndCBsb2FkZWQuIExpc3RlbiBmb3IgdGhlIGxvYWQgZXZlbnQuXG4gICAgLy8gICAgICAgICAvLyBpZighdGV4dHVyZS5faXNMb2FkZWQpe1xuICAgIC8vICAgICAgICAgLy8gICAgIHRleHR1cmUuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKXtcbiAgICAvLyAgICAgICAgIC8vICAgICAgICAgdmFyIHNpemUgPSB0ZXh0dXJlLmdldENvbnRlbnRTaXplKCk7XG4gICAgLy8gICAgICAgICAvLyAgICAgICAgIF90LnNldFRleHR1cmVSZWN0KGNjLnJlY3QoMCwwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCkpO1xuICAgIC8vICAgICAgICAgLy8gICAgIH0sIHRoaXMpO1xuICAgIC8vICAgICAgICAgLy8gfVxuICAgIC8vICAgICAgICAgcmV0dXJuO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIC8vIENDU3ByaXRlOiBzZXRUZXh0dXJlIGRvZXNuJ3Qgd29yayB3aGVuIHRoZSBzcHJpdGUgaXMgcmVuZGVyZWQgdXNpbmcgYSBDQ1Nwcml0ZVNoZWV0XG4gICAgLy8gICAgIGNjLmFzc2VydCghdGV4dHVyZSB8fCB0ZXh0dXJlIGluc3RhbmNlb2YgY2MuVGV4dHVyZTJELCBjYy5fTG9nSW5mb3MuU3ByaXRlX3NldFRleHR1cmVfMik7XG5cbiAgICAvLyAgICAgdGhpcy5fdGV4dHVyZSA9IHRleHR1cmU7XG4gICAgLy8gICAgIGlmICghdGhpcy5fdGV4dHVyZS5oYXNQcmVtdWx0aXBsaWVkQWxwaGEoKSkge1xuICAgIC8vICAgICAgICAgdGhpcy5fYmxlbmRGdW5jLnNyYyA9IGNjLlNSQ19BTFBIQTtcbiAgICAvLyAgICAgICAgIHRoaXMuX2JsZW5kRnVuYy5kc3QgPSBjYy5PTkVfTUlOVVNfU1JDX0FMUEhBO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgdGhpcy5fYmxlbmRGdW5jLnNyYyA9IGNjLkJMRU5EX1NSQztcbiAgICAvLyAgICAgICAgIHRoaXMuX2JsZW5kRnVuYy5kc3QgPSBjYy5CTEVORF9EU1Q7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9LFxuXG4gICAgLy8gZ2V0VGV4dHVyZTogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZTtcbiAgICAvLyB9LFxuXG4gICAgX3JlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZigodGhpcy5fYnVmZmVyPT1udWxsKSB8fCAodGhpcy5fYnVmZmVyLmxlbmd0aCA9PT0gMCkpIFxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBnbCA9IGNjLl9yZW5kZXJDb250ZXh0O1xuICAgICAgICBcbiAgICAgICAgZ2wuZW5hYmxlKCBnbC5ERVBUSF9URVNUICk7XG4gICAgICAgIGdsLmRlcHRoRnVuYyggZ2wuTEVRVUFMICk7XG5cbiAgICAgICAgY2MuZ2xFbmFibGVWZXJ0ZXhBdHRyaWJzKGNjLlZFUlRFWF9BVFRSSUJfRkxBR19QT1NfQ09MT1JfVEVYKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuX3RyaWFuZ2xlc1dlYkJ1ZmZlcik7XG5cbiAgICAgICAgaWYgKHRoaXMuX2RpcnR5KSB7XG4gICAgICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5fdHJpYW5nbGVzQXJyYXlCdWZmZXIsIGdsLlNUUkVBTV9EUkFXKTtcbiAgICAgICAgICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9tYXRlcmlhbHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgdmFyIGluZGljZXMgPSB0aGlzLl9zdWJNZXNoZXNbaV07XG4gICAgICAgICAgICBpZighaW5kaWNlcyB8fCBpbmRpY2VzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB2YXIgbWF0ZXJpYWwgPSB0aGlzLl9tYXRlcmlhbHNbaV07XG4gICAgICAgICAgICBjYy5nbEJpbmRUZXh0dXJlMkROKDAsIG1hdGVyaWFsKTsgIFxuXG4gICAgICAgICAgICB2YXIgdHJpYW5nbGVTaXplID0gY2MuVjNGX0M0Ql9UMkYuQllURVNfUEVSX0VMRU1FTlQ7XG5cbiAgICAgICAgICAgIC8vIHZlcnRleFxuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihjYy5WRVJURVhfQVRUUklCX1BPU0lUSU9OLCAzLCBnbC5GTE9BVCwgZmFsc2UsIHRyaWFuZ2xlU2l6ZSwgMCk7XG4gICAgICAgICAgICAvLyBjb2xvclxuICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihjYy5WRVJURVhfQVRUUklCX0NPTE9SLCA0LCBnbC5VTlNJR05FRF9CWVRFLCB0cnVlLCB0cmlhbmdsZVNpemUsIDEyKTtcbiAgICAgICAgICAgIC8vIHRleGNvb2RcbiAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoY2MuVkVSVEVYX0FUVFJJQl9URVhfQ09PUkRTLCAyLCBnbC5GTE9BVCwgZmFsc2UsIHRyaWFuZ2xlU2l6ZSwgMTYpO1xuXG4gICAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLl9idWZmZXJzVkJPWzFdW2ldKTtcbiAgICAgICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIGluZGljZXMubGVuZ3RoLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGdsLmRpc2FibGUoIGdsLkRFUFRIX1RFU1QgKTtcblxuICAgICAgICBjYy5pbmNyZW1lbnRHTERyYXdzKDEpO1xuICAgICAgICBjYy5jaGVja0dMRXJyb3JEZWJ1ZygpO1xuICAgIH0sXG5cbiAgICBjbGVhcjpmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J1ZmZlci5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLl9kaXJ0eSA9IHRydWU7XG4gICAgfSxcblxuICAgIF9jcmVhdGVSZW5kZXJDbWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBjbC5NZXNoU3ByaXRlLldlYkdMUmVuZGVyQ21kKHRoaXMpO1xuICAgIH1cbn0pOyAgICBcblxudmFyIF9wID0gY2wuTWVzaFNwcml0ZS5wcm90b3R5cGU7XG5jbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwidmVydGljZXNcIiwgXCJfZ2V0VmVydGljZXNcIiwgXCJfc2V0VmVydGljZXNcIik7XG5jbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwibWF0ZXJpYWxzXCIsIFwiX2dldE1hdGVyaWFsc1wiKTtcbmNsLmRlZmluZUdldHRlclNldHRlcihfcCwgXCJzdWJNZXNoZXNcIiwgXCJfZ2V0U3ViTWVzaGVzXCIpO1xuLy8gY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcInRleHR1cmVcIiwgXCJnZXRUZXh0dXJlXCIsIFwic2V0VGV4dHVyZVwiKTtcblxuY2wuTWVzaFNwcml0ZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBjbC5NZXNoU3ByaXRlKCk7XG59O1xuXG5cbi8vIE1lc2hTcHJpdGUgV2ViR0xSZW5kZXJDbWRcbihmdW5jdGlvbigpe1xuICAgIGNsLk1lc2hTcHJpdGUuV2ViR0xSZW5kZXJDbWQgPSBmdW5jdGlvbiAocmVuZGVyYWJsZU9iamVjdCkge1xuICAgICAgICBjYy5Ob2RlLldlYkdMUmVuZGVyQ21kLmNhbGwodGhpcywgcmVuZGVyYWJsZU9iamVjdCk7XG4gICAgICAgIHRoaXMuX25lZWREcmF3ID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgY2wuTWVzaFNwcml0ZS5XZWJHTFJlbmRlckNtZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGNjLk5vZGUuV2ViR0xSZW5kZXJDbWQucHJvdG90eXBlKTtcbiAgICBjbC5NZXNoU3ByaXRlLldlYkdMUmVuZGVyQ21kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNsLk1lc2hTcHJpdGUuV2ViR0xSZW5kZXJDbWQ7XG5cbiAgICBjbC5NZXNoU3ByaXRlLldlYkdMUmVuZGVyQ21kLnByb3RvdHlwZS5yZW5kZXJpbmcgPSBmdW5jdGlvbiAoY3R4KSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZTtcbiAgICAgICAgY2MuZ2xCbGVuZEZ1bmMobm9kZS5fYmxlbmRGdW5jLnNyYywgbm9kZS5fYmxlbmRGdW5jLmRzdCk7XG4gICAgICAgIHRoaXMuX3NoYWRlclByb2dyYW0udXNlKCk7XG4gICAgICAgIHRoaXMuX3NoYWRlclByb2dyYW0uX3NldFVuaWZvcm1Gb3JNVlBNYXRyaXhXaXRoTWF0NCh0aGlzLl9zdGFja01hdHJpeCk7XG4gICAgICAgIG5vZGUuX3JlbmRlcigpO1xuICAgIH07XG59KSgpO1xuIiwiY2wuRW51bVZhbHVlID0gZnVuY3Rpb24oRW51bSwga2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuRW51bSA9IEVudW07XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIFxuICAgIHRoaXMudG9KU09OID0gdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ2NsLkVudW0uJyArIEVudW0ubmFtZSArICcuJyArIGtleTtcbiAgICB9XG59XG5cbi8vIGNsLkVudW1cbmNsLkVudW0gPSBmdW5jdGlvbigpIHtcbiAgICBcbiAgICB2YXIgbmFtZSA9IGFyZ3VtZW50c1swXTtcbiAgICBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAwLDEpO1xuXG4gICAgaWYoY2xbbmFtZV0pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDYW4ndCByZWdpc2V0ZXIgRW51bSB3aXRoIGFuIGV4aXN0ZWQgbmFtZSBbJXNdXCIsIG5hbWUpO1xuICAgIH1cblxuXG4gICAgdmFyIGN1cnJlbnROdW1iZXIgPSAwO1xuICAgIHZhciBFbnVtID0ge307XG4gICAgRW51bS5uYW1lID0gbmFtZTtcblxuICAgIGZvcih2YXIgaT0wOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICAgIHZhciBrZXksIHZhbHVlO1xuXG4gICAgICAgIGlmKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuICAgICAgICAgICAga2V5ID0gYXJnWzBdO1xuICAgICAgICAgICAgY3VycmVudE51bWJlciA9IHZhbHVlID0gYXJnWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gYXJnO1xuICAgICAgICAgICAgdmFsdWUgPSBjdXJyZW50TnVtYmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgRW51bVtrZXldID0gbmV3IGNsLkVudW1WYWx1ZShFbnVtLCBrZXksIHZhbHVlKTtcblxuICAgICAgICBjdXJyZW50TnVtYmVyKys7XG4gICAgfVxuXG4gICAgRW51bS5mb3JFYWNoID0gZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgZm9yKHZhciBrIGluIHRoaXMpIHtcbiAgICAgICAgICAgIGlmKGsgIT09ICduYW1lJyAmJiBrICE9PSAnZm9yRWFjaCcpIHtcbiAgICAgICAgICAgICAgICBjYihrLCB0aGlzW2tdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsLkVudW1bbmFtZV0gPSBFbnVtO1xuXG4gICAgcmV0dXJuIEVudW07XG59XG5cblxuXG4vLyBjbC5Qb2ludFxuY2wuUG9pbnQgPSBmdW5jdGlvbih4LCB5KVxue1xuICAgIGlmICh4ID09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gMDtcbiAgICBlbHNlIGlmICh5ID09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnggPSB4Lng7IFxuICAgICAgICB0aGlzLnkgPSB4Lnk7XG4gICAgfSBlbHNlIGlmKHggPT0gdW5kZWZpbmVkICYmIHkgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uKHApe1xuICAgIHJldHVybiB0aGlzLnggPT0gcC54ICYmIHRoaXMueSA9PSBwLnk7XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihwKXtcbiAgICB2YXIgbiA9IG5ldyBjbC5Qb2ludCgpO1xuICAgIG4ueCA9IHRoaXMueCArIHAueDtcbiAgICBuLnkgPSB0aGlzLnkgKyBwLnk7XG4gICAgcmV0dXJuIG47XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5hZGRUb1NlbGYgPSBmdW5jdGlvbihwKXtcbiAgICB0aGlzLnggKz0gcC54O1xuICAgIHRoaXMueSArPSBwLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbihwKXtcbiAgICB2YXIgbiA9IG5ldyBjbC5Qb2ludCgpO1xuICAgIG4ueCA9IHRoaXMueCAtIHAueDtcbiAgICBuLnkgPSB0aGlzLnkgLSBwLnk7XG4gICAgcmV0dXJuIG47XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5zdWJUb1NlbGYgPSBmdW5jdGlvbihwKXtcbiAgICB0aGlzLnggLT0gcC54O1xuICAgIHRoaXMueSAtPSBwLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5tdWx0ID0gZnVuY3Rpb24odil7XG4gICAgdmFyIG4gPSBuZXcgY2wuUG9pbnQoKTtcbiAgICBuLnggPSB0aGlzLnggKiB2O1xuICAgIG4ueSA9IHRoaXMueSAqIHY7XG4gICAgcmV0dXJuIG47XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5tdWx0VG9TZWxmID0gZnVuY3Rpb24odil7XG4gICAgdGhpcy54ICo9IHY7XG4gICAgdGhpcy55ICo9IHY7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbmNsLlBvaW50LnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbih2KXtcbiAgICB2YXIgbiA9IG5ldyBjbC5Qb2ludCgpO1xuICAgIG4ueCA9IHRoaXMueCAvIHY7XG4gICAgbi55ID0gdGhpcy55IC8gdjtcbiAgICByZXR1cm4gbjtcbn1cblxuY2wuUG9pbnQucHJvdG90eXBlLmRpdmlkZVRvU2VsZiA9IGZ1bmN0aW9uKHYpe1xuICAgIHRoaXMueCAvPSB2O1xuICAgIHRoaXMueSAvPSB2O1xuICAgIHJldHVybiB0aGlzO1xufVxuXG5jbC5Qb2ludC5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdCA9IGNjLnBOb3JtYWxpemUodGhpcyk7XG4gICAgdGhpcy54ID0gdC54O1xuICAgIHRoaXMueSA9IHQueTtcbn1cblxuY2wuUG9pbnQucHJvdG90eXBlLmNyb3NzID0gZnVuY3Rpb24ocCl7XG4gICAgcmV0dXJuIHRoaXMueCAqIHAueSAtIHRoaXMueSAqIHAueDtcbn1cblxuY2wuUG9pbnQucHJvdG90eXBlLmluVHJpYW5nbGUgPSBmdW5jdGlvbihhLCBiLCBjKXtcblxuICAgIHZhciBhYiA9IGIuc3ViKGEpLFxuICAgICAgICBhYyA9IGMuc3ViKGEpLCBcbiAgICAgICAgYXAgPSB0aGlzLnN1YihhKTtcblxuICAgIHZhciBhYmMgPSBhYi5jcm9zcyhhYyk7XG4gICAgdmFyIGFicCA9IGFiLmNyb3NzKGFwKTtcbiAgICB2YXIgYXBjID0gYXAuY3Jvc3MoYWMpO1xuICAgIHZhciBwYmMgPSBhYmMgLSBhYnAgLSBhcGM7ICBcblxuICAgIHZhciBkZWx0YSA9IE1hdGguYWJzKGFiYykgLSBNYXRoLmFicyhhYnApIC0gTWF0aC5hYnMoYXBjKSAtIE1hdGguYWJzKHBiYyk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoZGVsdGEpIDwgMC4wNTsgICAgICAgIFxufVxuXG5jbC5Qb2ludC5sZXJwID0gZnVuY3Rpb24oYSwgYiwgYWxwaGEpe1xuICAgIHZhciB0ID0gY2MucExlcnAoYSxiLGFscGhhKTtcbiAgICByZXR1cm4gY2wucCh0LngsIHQueSk7XG59XG5cbmNsLlBvaW50LnNxck1hZ25pdHVkZSA9IGZ1bmN0aW9uKGEpe1xuICAgIHJldHVybiBhLnggKiBhLnggKyBhLnkgKiBhLnk7XG59XG5cblxuY2MucCA9IGNsLnAgPSBmdW5jdGlvbih4LHkpe1xuICAgIHJldHVybiBuZXcgY2wuUG9pbnQoeCwgeSk7XG59XG5cblxuXG4vLyBNYXRoXG5NYXRoLmxlcnAgPSBmdW5jdGlvbihhLCBiLCBhbHBoYSl7XG4gICAgcmV0dXJuIGEgKyAoYiAtIGEpICogYWxwaGE7XG59XG5cbk1hdGguY2xhbXAgPSBmdW5jdGlvbih2YWx1ZSwgbWluLCBtYXgpXG57XG4gICAgaWYgKHZhbHVlIDwgbWluKXtcbiAgICAgICAgdmFsdWUgPSBtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHZhbHVlID4gbWF4KSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG1heDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbkFycmF5LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRlbXAgPSBbXTtcbiAgICBcbiAgICBmb3IodmFyIGk9MDsgaTx0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRlbXAudW5zaGlmdCh0aGlzW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcDtcbn1cblxuTnVtYmVyLnByb3RvdHlwZS50b0ZpeGVkID0gZnVuY3Rpb24ocG9zKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoIHRoaXMgKiBNYXRoLnBvdygxMCwgcG9zKSApIC8gTWF0aC5wb3coMTAsIHBvcyk7XG59XG4iLCIvKmpzbGludCB2YXJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgZGV2ZWw6IHRydWUsIG5vbWVuOiB0cnVlLCBpbmRlbnQ6IDQsIG1heGVycjogNTAgKi9cbi8qZ2xvYmFsIGRlZmluZSwgJCAqL1xuXG4vKipcbiAqIEltcGxlbWVudHMgYSBqUXVlcnktbGlrZSBldmVudCBkaXNwYXRjaCBwYXR0ZXJuIGZvciBub24tRE9NIG9iamVjdHM6XG4gKiAgLSBMaXN0ZW5lcnMgYXJlIGF0dGFjaGVkIHZpYSBvbigpL29uZSgpICYgZGV0YWNoZWQgdmlhIG9mZigpXG4gKiAgLSBMaXN0ZW5lcnMgY2FuIHVzZSBuYW1lc3BhY2VzIGZvciBlYXN5IHJlbW92YWxcbiAqICAtIExpc3RlbmVycyBjYW4gYXR0YWNoIHRvIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlIHZpYSBhIHNwYWNlLXNlcGFyYXRlZCBsaXN0XG4gKiAgLSBFdmVudHMgYXJlIGZpcmVkIHZpYSB0cmlnZ2VyKClcbiAqICAtIFRoZSBzYW1lIGxpc3RlbmVyIGNhbiBiZSBhdHRhY2hlZCB0d2ljZSwgYW5kIHdpbGwgYmUgY2FsbGVkIHR3aWNlOyBidXQgb2ZmKCkgd2lsbCBkZXRhY2ggYWxsXG4gKiAgICBkdXBsaWNhdGUgY29waWVzIGF0IG9uY2UgKCdkdXBsaWNhdGUnIG1lYW5zICc9PT0nIGVxdWFsaXR5IC0gc2VlIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvYmY0cDI5ZzUvMS8pXG4gKiBcbiAqIEJ1dCBpdCBoYXMgc29tZSBpbXBvcnRhbnQgZGlmZmVyZW5jZXMgZnJvbSBqUXVlcnkncyBub24tRE9NIGV2ZW50IG1lY2hhbmlzbTpcbiAqICAtIE1vcmUgcm9idXN0IHRvIGxpc3RlbmVycyB0aGF0IHRocm93IGV4Y2VwdGlvbnMgKG90aGVyIGxpc3RlbmVycyB3aWxsIHN0aWxsIGJlIGNhbGxlZCwgYW5kXG4gKiAgICB0cmlnZ2VyKCkgd2lsbCBzdGlsbCByZXR1cm4gY29udHJvbCB0byBpdHMgY2FsbGVyKS5cbiAqICAtIEV2ZW50cyBjYW4gYmUgbWFya2VkIGRlcHJlY2F0ZWQsIGNhdXNpbmcgb24oKSB0byBpc3N1ZSB3YXJuaW5nc1xuICogIC0gRWFzaWVyIHRvIGRlYnVnLCBzaW5jZSB0aGUgZGlzcGF0Y2ggY29kZSBpcyBtdWNoIHNpbXBsZXJcbiAqICAtIEZhc3RlciwgZm9yIHRoZSBzYW1lIHJlYXNvblxuICogIC0gVXNlcyBsZXNzIG1lbW9yeSwgc2luY2UgJChub25ET01PYmopLm9uKCkgbGVha3MgbWVtb3J5IGluIGpRdWVyeVxuICogIC0gQVBJIGlzIHNpbXBsaWZpZWQ6XG4gKiAgICAgIC0gRXZlbnQgaGFuZGxlcnMgZG8gbm90IGhhdmUgJ3RoaXMnIHNldCB0byB0aGUgZXZlbnQgZGlzcGF0Y2hlciBvYmplY3RcbiAqICAgICAgLSBFdmVudCBvYmplY3QgcGFzc2VkIHRvIGhhbmRsZXJzIG9ubHkgaGFzICd0eXBlJyBhbmQgJ3RhcmdldCcgZmllbGRzXG4gKiAgICAgIC0gdHJpZ2dlcigpIHVzZXMgYSBzaW1wbGVyIGFyZ3VtZW50LWxpc3Qgc2lnbmF0dXJlIChsaWtlIFByb21pc2UgQVBJcyksIHJhdGhlciB0aGFuIHJlcXVpcmluZ1xuICogICAgICAgIGFuIEFycmF5IGFyZyBhbmQgaWdub3JpbmcgYWRkaXRpb25hbCBhcmdzXG4gKiAgICAgIC0gdHJpZ2dlcigpIGRvZXMgbm90IHN1cHBvcnQgbmFtZXNwYWNlc1xuICogICAgICAtIEZvciBzaW1wbGljaXR5LCBvbigpIGRvZXMgbm90IGFjY2VwdCBhIG1hcCBvZiBtdWx0aXBsZSBldmVudHMgLT4gbXVsdGlwbGUgaGFuZGxlcnMsIG5vciBhXG4gKiAgICAgICAgbWlzc2luZyBhcmcgc3RhbmRpbmcgaW4gZm9yIGEgYmFyZSAncmV0dXJuIGZhbHNlJyBoYW5kbGVyLlxuICogXG4gKiBGb3Igbm93LCBCcmFja2V0cyB1c2VzIGEgalF1ZXJ5IHBhdGNoIHRvIGVuc3VyZSAkKG9iaikub24oKSBhbmQgb2JqLm9uKCkgKGV0Yy4pIGFyZSBpZGVudGljYWxcbiAqIGZvciBhbnkgb2JqIHRoYXQgaGFzIHRoZSBFdmVudERpc3BhdGNoZXIgcGF0dGVybi4gSW4gdGhlIGZ1dHVyZSwgdGhpcyBtYXkgYmUgZGVwcmVjYXRlZC5cbiAqIFxuICogVG8gYWRkIEV2ZW50RGlzcGF0Y2hlciBtZXRob2RzIHRvIGFueSBvYmplY3QsIGNhbGwgRXZlbnREaXNwYXRjaGVyLm1ha2VFdmVudERpc3BhdGNoZXIob2JqKS5cbiAqL1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCwgcmVmKSB7XG4gICAgICAgIHZhciBuYW1lLCB2YWx1ZTtcbiAgICAgICAgZm9yICggbmFtZSBpbiByZWYgKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlZltuYW1lXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0WyBuYW1lIF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBTcGxpdCBcImV2ZW50Lm5hbWVzcGFjZVwiIHN0cmluZyBpbnRvIGl0cyB0d28gcGFydHM7IGJvdGggcGFydHMgYXJlIG9wdGlvbmFsLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgRXZlbnQgbmFtZSBhbmQvb3IgdHJhaWxpbmcgXCIubmFtZXNwYWNlXCJcbiAgICAgKiBAcmV0dXJuIHshe2V2ZW50OnN0cmluZywgbnM6c3RyaW5nfX0gVXNlcyBcIlwiIGZvciBtaXNzaW5nIHBhcnRzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNwbGl0TnMoZXZlbnRTdHIpIHtcbiAgICAgICAgdmFyIGRvdCA9IGV2ZW50U3RyLmluZGV4T2YoXCIuXCIpO1xuICAgICAgICBpZiAoZG90ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZXZlbnROYW1lOiBldmVudFN0ciB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHsgZXZlbnROYW1lOiBldmVudFN0ci5zdWJzdHJpbmcoMCwgZG90KSwgbnM6IGV2ZW50U3RyLnN1YnN0cmluZyhkb3QpIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBhZGRlZCBhcyBtaXhpbnMgdG8gYW55IG9iamVjdCBieSBtYWtlRXZlbnREaXNwYXRjaGVyKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBnaXZlbiBoYW5kbGVyIGZ1bmN0aW9uIHRvICdldmVudHMnOiBhIHNwYWNlLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIGV2ZW50IG5hbWVzLCBlYWNoXG4gICAgICogd2l0aCBhbiBvcHRpb25hbCBcIi5uYW1lc3BhY2VcIiAodXNlZCBieSBvZmYoKSAtIHNlZSBiZWxvdykuIElmIHRoZSBoYW5kbGVyIGlzIGFscmVhZHkgbGlzdGVuaW5nIHRvIHRoaXNcbiAgICAgKiBldmVudCwgYSBkdXBsaWNhdGUgY29weSBpcyBhZGRlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHshZnVuY3Rpb24oIXt0eXBlOnN0cmluZywgdGFyZ2V0OiFPYmplY3R9LCAuLi4pfSBmblxuICAgICAqL1xuICAgIHZhciBvbiA9IGZ1bmN0aW9uIChldmVudHMsIGZuKSB7XG4gICAgICAgIHZhciBldmVudHNMaXN0ID0gZXZlbnRzLnNwbGl0KC9cXHMrLykubWFwKHNwbGl0TnMpLFxuICAgICAgICAgICAgaTtcbiAgICAgICAgXG4gICAgICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGlvbiB3YXJuaW5nc1xuICAgICAgICBpZiAodGhpcy5fZGVwcmVjYXRlZEV2ZW50cykge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV2ZW50c0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVwcmVjYXRpb24gPSB0aGlzLl9kZXByZWNhdGVkRXZlbnRzW2V2ZW50c0xpc3RbaV0uZXZlbnROYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAoZGVwcmVjYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlJlZ2lzdGVyaW5nIGZvciBkZXByZWNhdGVkIGV2ZW50ICdcIiArIGV2ZW50c0xpc3RbaV0uZXZlbnROYW1lICsgXCInLlwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRlcHJlY2F0aW9uID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IFwiIEluc3RlYWQsIHVzZSBcIiArIGRlcHJlY2F0aW9uICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UsIG5ldyBFcnJvcigpLnN0YWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEF0dGFjaCBsaXN0ZW5lciBmb3IgZWFjaCBldmVudCBjbGF1c2VcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGV2ZW50c0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBldmVudE5hbWUgPSBldmVudHNMaXN0W2ldLmV2ZW50TmFtZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudHNMaXN0W2ldLmhhbmRsZXIgPSBmbjtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnROYW1lXS5wdXNoKGV2ZW50c0xpc3RbaV0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBvbmUgb3IgbW9yZSBoYW5kbGVyIGZ1bmN0aW9ucyBiYXNlZCBvbiB0aGUgc3BhY2Utc2VwYXJhdGVkICdldmVudHMnIGxpc3QuIEVhY2ggaXRlbSBpblxuICAgICAqICdldmVudHMnIGNhbiBiZTogYmFyZSBldmVudCBuYW1lLCBiYXJlIC5uYW1lc3BhY2UsIG9yIGV2ZW50Lm5hbWVzcGFjZSBwYWlyLiBUaGlzIHlpZWxkcyBhIHNldCBvZlxuICAgICAqIG1hdGNoaW5nIGhhbmRsZXJzLiBJZiAnZm4nIGlzIG9tbWl0dGVkLCBhbGwgdGhlc2UgaGFuZGxlcnMgYXJlIHJlbW92ZWQuIElmICdmbicgaXMgcHJvdmlkZWQsXG4gICAgICogb25seSBoYW5kbGVycyBleGFjdGx5IGVxdWFsIHRvICdmbicgYXJlIHJlbW92ZWQgKHRoZXJlIG1heSBzdGlsbCBiZSA+MSwgaWYgZHVwbGljYXRlcyB3ZXJlIGFkZGVkKS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHs/ZnVuY3Rpb24oIXt0eXBlOnN0cmluZywgdGFyZ2V0OiFPYmplY3R9LCAuLi4pfSBmblxuICAgICAqL1xuICAgIHZhciBvZmYgPSBmdW5jdGlvbiAoZXZlbnRzLCBmbikge1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgZXZlbnRzTGlzdCA9IGV2ZW50cy5zcGxpdCgvXFxzKy8pLm1hcChzcGxpdE5zKSxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIFxuICAgICAgICB2YXIgcmVtb3ZlQWxsTWF0Y2hlcyA9IGZ1bmN0aW9uIChldmVudFJlYywgZXZlbnROYW1lKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlckxpc3QgPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0sXG4gICAgICAgICAgICAgICAgaztcbiAgICAgICAgICAgIGlmICghaGFuZGxlckxpc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFdhbGsgYmFja3dhcmRzIHNvIGl0J3MgZWFzeSB0byByZW1vdmUgaXRlbXNcbiAgICAgICAgICAgIGZvciAoayA9IGhhbmRsZXJMaXN0Lmxlbmd0aCAtIDE7IGsgPj0gMDsgay0tKSB7XG4gICAgICAgICAgICAgICAgLy8gTG9vayBhdCBucyAmIGZuIG9ubHkgLSBkb1JlbW92ZSgpIGhhcyBhbHJlYWR5IHRha2VuIGNhcmUgb2YgZXZlbnROYW1lXG4gICAgICAgICAgICAgICAgaWYgKCFldmVudFJlYy5ucyB8fCBldmVudFJlYy5ucyA9PT0gaGFuZGxlckxpc3Rba10ubnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBoYW5kbGVyTGlzdFtrXS5oYW5kbGVyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZuIHx8IGZuID09PSBoYW5kbGVyIHx8IGZuLl9ldmVudE9uY2VXcmFwcGVyID09PSBoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTGlzdC5zcGxpY2UoaywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXJMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkb1JlbW92ZSA9IGZ1bmN0aW9uIChldmVudFJlYykge1xuICAgICAgICAgICAgaWYgKGV2ZW50UmVjLmV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGFyZyBjYWxscyBvdXQgYW4gZXZlbnQgbmFtZSwgbG9vayBhdCB0aGF0IGhhbmRsZXIgbGlzdCBvbmx5XG4gICAgICAgICAgICAgICAgcmVtb3ZlQWxsTWF0Y2hlcyhldmVudFJlYywgZXZlbnRSZWMuZXZlbnROYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgYXJnIG9ubHkgZ2l2ZXMgYSBuYW1lc3BhY2UsIGxvb2sgYXQgaGFuZGxlciBsaXN0cyBmb3IgYWxsIGV2ZW50c1xuICAgICAgICAgICAgICAgIGZvcih2YXIgZXZlbnRuYW1lIGluIHRoaXMuX2V2ZW50SGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBcdHJlbW92ZUFsbE1hdGNoZXMoZXZlbnRSZWMsIGV2ZW50TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgIFxuICAgICAgICAvLyBEZXRhY2ggbGlzdGVuZXIgZm9yIGVhY2ggZXZlbnQgY2xhdXNlXG4gICAgICAgIC8vIEVhY2ggY2xhdXNlIG1heSBiZTogYmFyZSBldmVudG5hbWUsIGJhcmUgLm5hbWVzcGFjZSwgZnVsbCBldmVudG5hbWUubmFtZXNwYWNlXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBldmVudHNMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkb1JlbW92ZShldmVudHNMaXN0W2ldKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgaGFuZGxlciBzbyBpdCdzIG9ubHkgY2FsbGVkIG9uY2UgKHBlciBldmVudCBpbiB0aGUgJ2V2ZW50cycgbGlzdCkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50c1xuICAgICAqIEBwYXJhbSB7P2Z1bmN0aW9uKCF7dHlwZTpzdHJpbmcsIHRhcmdldDohT2JqZWN0fSwgLi4uKX0gZm5cbiAgICAgKi9cbiAgICB2YXIgb25lID0gZnVuY3Rpb24gKGV2ZW50cywgZm4pIHtcbiAgICAgICAgLy8gV3JhcCBmbiBpbiBhIHNlbGYtZGV0YWNoaW5nIGhhbmRsZXI7IHNhdmVkIG9uIHRoZSBvcmlnaW5hbCBmbiBzbyBvZmYoKSBjYW4gZGV0ZWN0IGl0IGxhdGVyXG4gICAgICAgIGlmICghZm4uX2V2ZW50T25jZVdyYXBwZXIpIHtcbiAgICAgICAgICAgIGZuLl9ldmVudE9uY2VXcmFwcGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyB3cmFwcGVyIGlzIHJldXNlZCBmb3IgYWxsIGF0dGFjaG1lbnRzIG9mIHRoZSBzYW1lIGZuLCBzbyBpdCBzaG91bGRuJ3QgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgLy8gYW55dGhpbmcgZnJvbSB0aGUgb3V0ZXIgY2xvc3VyZSBvdGhlciB0aGFuICdmbidcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQub2ZmKGV2ZW50LnR5cGUsIGZuLl9ldmVudE9uY2VXcmFwcGVyKTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5vbihldmVudHMsIGZuLl9ldmVudE9uY2VXcmFwcGVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEludm9rZXMgYWxsIGhhbmRsZXJzIGZvciB0aGUgZ2l2ZW4gZXZlbnQgKGluIHRoZSBvcmRlciB0aGV5IHdlcmUgYWRkZWQpLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0geyp9IC4uLiBBbnkgYWRkaXRpb25hbCBhcmdzIGFyZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXIgYWZ0ZXIgdGhlIGV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIHZhciB0cmlnZ2VyID0gZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgICB2YXIgZXZlbnQgPSB7IHR5cGU6IGV2ZW50TmFtZSwgdGFyZ2V0OiB0aGlzIH0sXG4gICAgICAgICAgICBoYW5kbGVyTGlzdCA9IHRoaXMuX2V2ZW50SGFuZGxlcnMgJiYgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdLFxuICAgICAgICAgICAgaTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaGFuZGxlckxpc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gVXNlIGEgY2xvbmUgb2YgdGhlIGxpc3QgaW4gY2FzZSBoYW5kbGVycyBjYWxsIG9uKCkvb2ZmKCkgd2hpbGUgd2UncmUgc3RpbGwgaW4gdGhlIGxvb3BcbiAgICAgICAgaGFuZGxlckxpc3QgPSBoYW5kbGVyTGlzdC5zbGljZSgpO1xuXG4gICAgICAgIC8vIFBhc3MgJ2V2ZW50JyBvYmplY3QgZm9sbG93ZWQgYnkgYW55IGFkZGl0aW9uYWwgYXJncyB0cmlnZ2VyKCkgd2FzIGdpdmVuXG4gICAgICAgIHZhciBhcHBseUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBhcHBseUFyZ3MudW5zaGlmdChldmVudCk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGhhbmRsZXJMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIENhbGwgb25lIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBoYW5kbGVyTGlzdFtpXS5oYW5kbGVyLmFwcGx5KG51bGwsIGFwcGx5QXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXhjZXB0aW9uIGluICdcIiArIGV2ZW50TmFtZSArIFwiJyBsaXN0ZW5lciBvblwiLCB0aGlzLCBTdHJpbmcoZXJyKSwgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmFzc2VydCgpOyAgLy8gY2F1c2VzIGRldiB0b29scyB0byBwYXVzZSwganVzdCBsaWtlIGFuIHVuY2F1Z2h0IGV4Y2VwdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBFdmVudERpc3BhdGNoZXIgQVBJcyB0byB0aGUgZ2l2ZW4gb2JqZWN0OiBvbigpLCBvbmUoKSwgb2ZmKCksIGFuZCB0cmlnZ2VyKCkuIE1heSBhbHNvIGJlXG4gICAgICogY2FsbGVkIG9uIGEgcHJvdG90eXBlIG9iamVjdCAtIGVhY2ggaW5zdGFuY2Ugd2lsbCBzdGlsbCBiZWhhdmUgaW5kZXBlbmRlbnRseS5cbiAgICAgKiBAcGFyYW0geyFPYmplY3R9IG9iaiBPYmplY3QgdG8gYWRkIGV2ZW50LWRpc3BhdGNoIG1ldGhvZHMgdG9cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYWtlRXZlbnREaXNwYXRjaGVyKG9iaikge1xuICAgICAgICBleHRlbmQob2JqLCB7XG4gICAgICAgICAgICBvbjogb24sXG4gICAgICAgICAgICBvZmY6IG9mZixcbiAgICAgICAgICAgIG9uZTogb25lLFxuICAgICAgICAgICAgdHJpZ2dlcjogdHJpZ2dlcixcbiAgICAgICAgICAgIF9FdmVudERpc3BhdGNoZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIExhdGVyLCBvbigpIG1heSBhZGQgX2V2ZW50SGFuZGxlcnM6IE9iamVjdC48c3RyaW5nLCBBcnJheS48e2V2ZW50OnN0cmluZywgbmFtZXNwYWNlOj9zdHJpbmcsXG4gICAgICAgIC8vICAgaGFuZGxlcjohZnVuY3Rpb24oIXt0eXBlOnN0cmluZywgdGFyZ2V0OiFPYmplY3R9LCAuLi4pfT4+IC0gbWFwIGZyb20gZXZlbnROYW1lIHRvIGFuIGFycmF5XG4gICAgICAgIC8vICAgb2YgaGFuZGxlciByZWNvcmRzXG4gICAgICAgIC8vIExhdGVyLCBtYXJrRGVwcmVjYXRlZCgpIG1heSBhZGQgX2RlcHJlY2F0ZWRFdmVudHM6IE9iamVjdC48c3RyaW5nLCBzdHJpbmd8Ym9vbGVhbj4gLSBtYXAgZnJvbVxuICAgICAgICAvLyAgIGV2ZW50TmFtZSB0byBkZXByZWNhdGlvbiB3YXJuaW5nIGluZm9cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogVXRpbGl0eSBmb3IgY2FsbGluZyBvbigpIHdpdGggYW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdG8gZXZlbnQgaGFuZGxlcnMgKHJhdGhlciB0aGFuIGEgdmFyYXJnc1xuICAgICAqIGxpc3QpLiBtYWtlRXZlbnREaXNwYXRjaGVyKCkgbXVzdCBoYXZlIHByZXZpb3VzbHkgYmVlbiBjYWxsZWQgb24gJ2Rpc3BhdGNoZXInLlxuICAgICAqIEBwYXJhbSB7IU9iamVjdH0gZGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0geyFBcnJheS48Kj59IGFyZ3NBcnJheVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyaWdnZXJXaXRoQXJyYXkoZGlzcGF0Y2hlciwgZXZlbnROYW1lLCBhcmdzQXJyYXkpIHtcbiAgICAgICAgdmFyIHRyaWdnZXJBcmdzID0gW2V2ZW50TmFtZV0uY29uY2F0KGFyZ3NBcnJheSk7XG4gICAgICAgIGRpc3BhdGNoZXIudHJpZ2dlci5hcHBseShkaXNwYXRjaGVyLCB0cmlnZ2VyQXJncyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFV0aWxpdHkgZm9yIGF0dGFjaGluZyBhbiBldmVudCBoYW5kbGVyIHRvIGFuIG9iamVjdCB0aGF0IGhhcyBub3QgWUVUIGhhZCBtYWtlRXZlbnREaXNwYXRjaGVyKCkgY2FsbGVkXG4gICAgICogb24gaXQsIGJ1dCB3aWxsIGluIHRoZSBmdXR1cmUuIE9uY2UgJ2Z1dHVyZURpc3BhdGNoZXInIGJlY29tZXMgYSByZWFsIGV2ZW50IGRpc3BhdGNoZXIsIGFueSBoYW5kbGVyc1xuICAgICAqIGF0dGFjaGVkIGhlcmUgd2lsbCBiZSByZXRhaW5lZC5cbiAgICAgKiBcbiAgICAgKiBVc2VmdWwgd2l0aCBjb3JlIG1vZHVsZXMgdGhhdCBoYXZlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyAob25lIG1vZHVsZSBpbml0aWFsbHkgZ2V0cyBhbiBlbXB0eSBjb3B5IG9mIHRoZVxuICAgICAqIG90aGVyLCB3aXRoIG5vIG9uKCkgQVBJIHByZXNlbnQgeWV0KS4gVW5saWtlIG90aGVyIHN0cmF0ZWdpZXMgbGlrZSB3YWl0aW5nIGZvciBodG1sUmVhZHkoKSwgdGhpcyBoZWxwZXJcbiAgICAgKiBndWFyYW50ZWVzIHlvdSB3b24ndCBtaXNzIGFueSBmdXR1cmUgZXZlbnRzLCByZWdhcmRsZXNzIG9mIGhvdyBzb29uIHRoZSBvdGhlciBtb2R1bGUgZmluaXNoZXMgaW5pdCBhbmRcbiAgICAgKiBzdGFydHMgY2FsbGluZyB0cmlnZ2VyKCkuXG4gICAgICogXG4gICAgICogQHBhcmFtIHshT2JqZWN0fSBmdXR1cmVEaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50c1xuICAgICAqIEBwYXJhbSB7P2Z1bmN0aW9uKCF7dHlwZTpzdHJpbmcsIHRhcmdldDohT2JqZWN0fSwgLi4uKX0gZm5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbl9kdXJpbmdJbml0KGZ1dHVyZURpc3BhdGNoZXIsIGV2ZW50cywgZm4pIHtcbiAgICAgICAgb24uY2FsbChmdXR1cmVEaXNwYXRjaGVyLCBldmVudHMsIGZuKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogTWFyayBhIGdpdmVuIGV2ZW50IG5hbWUgYXMgZGVwcmVjYXRlZCwgc3VjaCB0aGF0IG9uKCkgd2lsbCBlbWl0IHdhcm5pbmdzIHdoZW4gY2FsbGVkIHdpdGggaXQuXG4gICAgICogTWF5IGJlIGNhbGxlZCBiZWZvcmUgbWFrZUV2ZW50RGlzcGF0Y2hlcigpLiBNYXkgYmUgY2FsbGVkIG9uIGEgcHJvdG90eXBlIHdoZXJlIG1ha2VFdmVudERpc3BhdGNoZXIoKVxuICAgICAqIGlzIGNhbGxlZCBzZXBhcmF0ZWx5IHBlciBpbnN0YW5jZSAoaS5lLiBpbiB0aGUgY29uc3RydWN0b3IpLiBTaG91bGQgYmUgY2FsbGVkIGJlZm9yZSBjbGllbnRzIGhhdmVcbiAgICAgKiBhIGNoYW5jZSB0byBzdGFydCBjYWxsaW5nIG9uKCkuXG4gICAgICogQHBhcmFtIHshT2JqZWN0fSBvYmogRXZlbnQgZGlzcGF0Y2hlciBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIE5hbWUgb2YgZGVwcmVjYXRlZCBldmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gaW5zdGVhZFN0ciBTdWdnZXN0ZWQgdGhpbmcgdG8gdXNlIGluc3RlYWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXJrRGVwcmVjYXRlZChvYmosIGV2ZW50TmFtZSwgaW5zdGVhZFN0cikge1xuICAgICAgICAvLyBNYXJrIGV2ZW50IGFzIGRlcHJlY2F0ZWQgLSBvbigpIHdpbGwgZW1pdCB3YXJuaW5ncyB3aGVuIGNhbGxlZCB3aXRoIHRoaXMgZXZlbnRcbiAgICAgICAgaWYgKCFvYmouX2RlcHJlY2F0ZWRFdmVudHMpIHtcbiAgICAgICAgICAgIG9iai5fZGVwcmVjYXRlZEV2ZW50cyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIG9iai5fZGVwcmVjYXRlZEV2ZW50c1tldmVudE5hbWVdID0gaW5zdGVhZFN0ciB8fCB0cnVlO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBleHBvcnRzLm1ha2VFdmVudERpc3BhdGNoZXIgPSBtYWtlRXZlbnREaXNwYXRjaGVyO1xuICAgIGV4cG9ydHMudHJpZ2dlcldpdGhBcnJheSAgICA9IHRyaWdnZXJXaXRoQXJyYXk7XG4gICAgZXhwb3J0cy5vbl9kdXJpbmdJbml0ICAgICAgID0gb25fZHVyaW5nSW5pdDtcbiAgICBleHBvcnRzLm1hcmtEZXByZWNhdGVkICAgICAgPSBtYXJrRGVwcmVjYXRlZDtcbn0pO1xuIiwiKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIFRpbWUgPSByZXF1aXJlKCcuL1RpbWUuanMnKTtcblxuICAgIHZhciBLZXlNYW5hZ2VyID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXG4gICAgICAgIHZhciBfbWFwID0ge307XG5cbiAgICAgICAgdGhpcy5pc0tleURvd24gPSBmdW5jdGlvbihrZXksIGR1cmF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBfbWFwW2tleV07XG4gICAgICAgICAgICBpZighc3RhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGR1cmF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFRpbWUubm93IC0gc3RhdGUudGltZSkgPD0gZHVyYXRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5wcmVzc2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNLZXlSZWxlYXNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBfbWFwW2tleV07XG4gICAgICAgICAgICByZXR1cm4gIXN0YXRlIHx8ICFzdGF0ZS5wcmVzc2VkO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXRjaEtleURvd24gPSBmdW5jdGlvbihrZXlzKSB7XG4gICAgICAgICAgICBrZXlzID0ga2V5cy5sZW5ndGggPyBrZXlzIDogW2tleXNdO1xuXG4gICAgICAgICAgICBpZihPYmplY3Qua2V5cyhfbWFwKS5sZW5ndGggIT09IGtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSB0cnVlO1xuXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4ga2V5cykge1xuICAgICAgICAgICAgICAgIGlmKCFfbWFwW2tleXNbaV1dKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25LZXlQcmVzc2VkID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBfbWFwW2tleV07XG4gICAgICAgICAgICBpZihzdGF0ZSAmJiBzdGF0ZS5wcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfbWFwW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgcHJlc3NlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0aW1lOiBUaW1lLm5vd1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25LZXlSZWxlYXNlZCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgX21hcFtrZXldID0ge1xuICAgICAgICAgICAgICAgIHByZXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZvciB3ZWIgYXBwbGljYXRpb25cbiAgICAgICAgaWYoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbktleVByZXNzZWQoZS53aGljaCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uS2V5UmVsZWFzZWQoZS53aGljaCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbC5rZXlNYW5hZ2VyID0gbmV3IEtleU1hbmFnZXI7XG4gICAgY2wuS2V5TWFuYWdlciA9IEtleU1hbmFnZXI7XG5cbiAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoY2MuRXZlbnRMaXN0ZW5lci5jcmVhdGUoe1xuXG4gICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuXG4gICAgICAgIG9uS2V5UHJlc3NlZCA6IGNsLmtleU1hbmFnZXIub25LZXlQcmVzc2VkLFxuICAgICAgICBvbktleVJlbGVhc2VkOiBjbC5rZXlNYW5hZ2VyLm9uS2V5UmVsZWFzZWRcblxuICAgIH0pLCAxMDAwMCk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsLmtleU1hbmFnZXI7XG59KTtcbiIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBDb21wb25lbnQgID0gcmVxdWlyZShcIi4uL2NvbXBvbmVudC9Db21wb25lbnQuanNcIik7XG4gICAgdmFyIEdhbWVPYmplY3QgPSByZXF1aXJlKFwiLi4vY29yZS9HYW1lT2JqZWN0LmpzXCIpO1xuXG4gICAgdmFyIF9kZXNlcmlhbGl6ZUZ1bmNzID0gW107XG5cbiAgICAvLyBzZXJpYWxpemUgZnVuY3Rpb25cblxuICAgIGNjLlNwcml0ZS5wcm90b3R5cGUudG9KU09OICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHRoaXMuZ2V0VGV4dHVyZSgpO1xuICAgICAgICByZXR1cm4gdGV4dHVyZSA/IHRleHR1cmUudXJsIDogXCJcIjtcbiAgICB9O1xuXG4gICAgY2MuQ29sb3IucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2MuY29sb3JUb0hleCh0aGlzKTtcbiAgICB9XG5cbiAgICBjYy5TY2VuZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBqc29uICAgICAgICAgID0ge307XG4gICAgICAgIGpzb24ucm9vdCAgICAgICAgID0ge307XG4gICAgICAgIGpzb24ucm9vdC5yZXMgICAgID0gdGhpcy5yZXM7XG4gICAgICAgIGpzb24ucm9vdC5waHlzaWNzID0gdGhpcy5waHlzaWNzO1xuXG4gICAgICAgIHZhciBjaGlsZHJlbkpzb24gID0ganNvbi5yb290LmNoaWxkcmVuID0gW107XG4gICAgICAgIHZhciBjaGlsZHJlbiAgICAgID0gdGhpcy5jaGlsZHJlbjtcblxuICAgICAgICBpZih0aGlzLmNhbnZhcykge1xuICAgICAgICAgICAgY2hpbGRyZW4gICAgICAgICAgICAgICAgPSB0aGlzLmNhbnZhcy5jaGlsZHJlbjtcbiAgICAgICAgICAgIGpzb24ucm9vdC5jYW52YXMgICAgICAgID0ge307XG4gICAgICAgICAgICBqc29uLnJvb3QuY2FudmFzLm9mZnNldCA9IHRoaXMuY2FudmFzLm9mZnNldDtcbiAgICAgICAgICAgIGpzb24ucm9vdC5jYW52YXMuc2NhbGUgID0gdGhpcy5jYW52YXMuc2NhbGU7ICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKHZhciBrPTA7IGs8Y2hpbGRyZW4ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2tdO1xuXG4gICAgICAgICAgICBpZihjaGlsZC5jb25zdHJ1Y3RvciA9PT0gY2wuR2FtZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBjaiA9IGNoaWxkLnRvSlNPTigpO1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuSnNvbi5wdXNoKGNqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH07XG5cbiAgICBjbC5Qb2ludC5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4IDogdGhpcy54LnRvRml4ZWQoMyksXG4gICAgICAgICAgICB5IDogdGhpcy55LnRvRml4ZWQoMylcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBHYW1lT2JqZWN0LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIganNvbiA9IHt9O1xuXG4gICAgICAgIHZhciBjb21wb25lbnRzID0ganNvbi5jb21wb25lbnRzID0gW107XG5cbiAgICAgICAgdmFyIGNzID0gdGhpcy5jb21wb25lbnRzO1xuICAgICAgICBmb3IodmFyIGk9MDsgaTxjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGNzW2ldLnRvSlNPTigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgaz0wOyBrPHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBrKyspe1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltrXTtcbiAgICAgICAgICAgIGlmKGNoaWxkLmNvbnN0cnVjdG9yID09PSBjbC5HYW1lT2JqZWN0KXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZighanNvbi5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBqc29uLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGNqID0gY2hpbGQudG9KU09OKCk7XG4gICAgICAgICAgICAgICAganNvbi5jaGlsZHJlbi5wdXNoKGNqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAganNvbltwXSA9IHNlbGZbcF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH07XG5cbiAgICBDb21wb25lbnQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIganNvbiA9IHt9O1xuICAgICAgICBqc29uLmNsYXNzID0gdGhpcy5jbGFzc05hbWU7XG5cbiAgICAgICAgdmFyIHNlcmlhbGl6YXRpb24gPSB0aGlzLnByb3BlcnRpZXM7XG4gICAgICAgIGlmKHRoaXMuc2VyaWFsaXphdGlvbikge1xuICAgICAgICAgICAgc2VyaWFsaXphdGlvbiA9IHRoaXMuc2VyaWFsaXphdGlvbi5jb25jYXQodGhpcy5wcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlcmlhbGl6YXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBrID0gc2VyaWFsaXphdGlvbltpXTtcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpc1trXTtcblxuICAgICAgICAgICAgaWYodGhpc1tcInRvSlNPTlwiK2tdKSB7XG4gICAgICAgICAgICAgICAganNvbltrXSA9IHRoaXNbXCJ0b0pTT05cIitrXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAganNvbltrXSA9IHZhbHVlLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGpzb25ba10gPSB2YWx1ZS50b0pTT04gPyB2YWx1ZS50b0pTT04oKSA6IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH07XG5cblxuICAgIC8vIGRlc2VyaWFsaXplIGZ1bmN0aW9uXG5cbiAgICB2YXIgcmVnaXN0ZXJEZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgX2Rlc2VyaWFsaXplRnVuY3MucHVzaChmdW5jKTtcbiAgICB9O1xuXG4gICAgdmFyIHRyeVJldml2ZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPF9kZXNlcmlhbGl6ZUZ1bmNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciByZXQgPSBfZGVzZXJpYWxpemVGdW5jc1tpXShrZXksIHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGlmKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvbXBvbmVudC50cnlSZXZpdmVyIGZvciBbJXNdZmFpbGVkIDogXCIsIGtleSwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG5cbiAgICB2YXIgc3RyaW5nUGFyc2VycyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgcmU6IC8jPyhbYS1mQS1GMC05XXsyfSkoW2EtZkEtRjAtOV17Mn0pKFthLWZBLUYwLTldezJ9KS8sXG4gICAgICAgICAgICBwYXJzZTogZnVuY3Rpb24oZXhlY1Jlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYy5jb2xvcihleGVjUmVzdWx0WzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcmU6IC9jbC5FbnVtLihcXHcqKStcXC4oXFx3KikrLyxcbiAgICAgICAgICAgIHBhcnNlOiBmdW5jdGlvbihleGVjUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsLkVudW1bZXhlY1Jlc3VsdFsxXV1bZXhlY1Jlc3VsdFsyXV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgLy8gcmVnaXN0ZXIgZGVmYXVsdCBkZXNlcmlhbGl6ZVxuICAgIHJlZ2lzdGVyRGVzZXJpYWxpemUoZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXG4gICAgICAgIHZhciByZXQgPSBudWxsO1xuXG4gICAgICAgIGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICAgICAgc3RyaW5nUGFyc2Vycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnNlcikge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IHBhcnNlci5yZS5leGVjKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIGlmKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldCA9IHBhcnNlci5wYXJzZShtYXRjaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0pO1xuXG5cbiAgICBDb21wb25lbnQuZnJvbUpTT04gPSBmdW5jdGlvbihvYmplY3QsIGpzb24pIHtcbiAgICAgICAgdmFyIGMgPSBvYmplY3QuYWRkQ29tcG9uZW50KGpzb24uY2xhc3MpO1xuICAgICAgICBpZihjID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgZm9yKHZhciBrIGluIGpzb24pIHtcbiAgICAgICAgICAgIGlmKGsgPT0gXCJjbGFzc1wiKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHZhbHVlID0ganNvbltrXTtcblxuICAgICAgICAgICAgdmFyIHJldCA9IHRyeVJldml2ZXIoaywgdmFsdWUpO1xuICAgICAgICAgICAgaWYocmV0KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNba10gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjO1xuICAgIH07XG5cbiAgICBHYW1lT2JqZWN0LmZyb21KU09OID0gZnVuY3Rpb24oanNvbikge1xuICAgICAgICB2YXIgbyA9IG5ldyBHYW1lT2JqZWN0KCk7XG5cbiAgICAgICAgby5wcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgb1twXSA9IGpzb25bcF0gPT09IHVuZGVmaW5lZCA/IG9bcF0gOiBqc29uW3BdO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IodmFyIGk9MDsgaTxqc29uLmNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIENvbXBvbmVudC5mcm9tSlNPTihvLCBqc29uLmNvbXBvbmVudHNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoanNvbi5jaGlsZHJlbikge1xuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGk8anNvbi5jaGlsZHJlbi5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgR2FtZU9iamVjdC5mcm9tSlNPTihvLCBqc29uLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvO1xuICAgIH07XG5cbiAgICBleHBvcnRzLnJlZ2lzdGVyRGVzZXJpYWxpemUgPSByZWdpc3RlckRlc2VyaWFsaXplO1xuICAgIGV4cG9ydHMudHJ5UmV2aXZlciAgICAgICAgICA9IHRyeVJldml2ZXI7XG5cbiAgICBjbC5TZXJpYWxpemF0aW9uID0gZXhwb3J0cztcbn0pOyIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciB0aW1lID0gMDtcblxuICAgIHZhciBUaW1lID0ge1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGR0KSB7XG4gICAgICAgICAgICB0aW1lICs9IDAuMDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoVGltZSwgJ25vdycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGltZTtcbiAgICB9KTtcblxuICAgIHNldEludGVydmFsKFRpbWUudXBkYXRlLCAxMCk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFRpbWU7XG59KTsiLCIvKmpzbGludCB2YXJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgZGV2ZWw6IHRydWUsIG5vbWVuOiB0cnVlLCByZWdleHA6IHRydWUsIGluZGVudDogNCwgbWF4ZXJyOiA1MCAqL1xuLypnbG9iYWwgY2wsIGNjKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIENvbXBvbmVudCA9IHJlcXVpcmUoXCIuLi9mcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL2NvbXBvbmVudC9Db21wb25lbnQuanNcIik7XG5cbiAgICB2YXIgUGFyYW1zID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdGhpcy5jdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcihbXSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9mb2xkZXJfID0gXCJTY3JpcHRcIjtcbiAgICB9XG5cbiAgICB2YXIgQ2FtZXJhRm9sbG93ID0gQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudChcIkNhbWVyYUZvbGxvd1wiLCBuZXcgUGFyYW1zKTtcblxuICAgIFxuICAgIGV4cG9ydHMuQ29uc3RydWN0b3IgPSBDYW1lcmFGb2xsb3c7XG4gICAgZXhwb3J0cy5QYXJhbXMgPSBQYXJhbXM7XG59KTsiLCIvKmpzbGludCB2YXJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgZGV2ZWw6IHRydWUsIG5vbWVuOiB0cnVlLCByZWdleHA6IHRydWUsIGluZGVudDogNCwgbWF4ZXJyOiA1MCAqL1xuLypnbG9iYWwgY2wsIGNjKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIENvbXBvbmVudCAgPSByZXF1aXJlKFwiLi4vZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvQ29tcG9uZW50LmpzXCIpO1xuICAgIHZhciBLZXlNYW5hZ2VyID0gcmVxdWlyZShcIi4uL2ZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvdXRpbHMvS2V5TWFuYWdlci5qc1wiKTtcblxuICAgIHZhciBQYXJhbXMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSBbXCJtYXhTcGVlZFwiLCBcImFjY2VsZXJhdGlvblwiLCBcImRyYWdcIiwgXCJqdW1wU3BlZWRcIl07XG5cbiAgICAgICAgdGhpcy5tYXhTcGVlZCAgICAgPSA1MDA7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gMTUwMDtcbiAgICAgICAgdGhpcy5kcmFnICAgICAgICAgPSA2MDA7XG4gICAgICAgIHRoaXMuanVtcFNwZWVkICAgID0gMjAwO1xuXG4gICAgICAgIHRoaXMuanVtcGluZyAgICAgID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5jdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcihbJ1BoeXNpY3NCb2R5J10pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vbkVudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnQgPSB0aGlzLmdldENvbXBvbmVudChcIlRyYW5zZm9ybUNvbXBvbmVudFwiKTtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiUGh5c2ljc0JvZHlcIik7XG4gICAgICAgICAgICB0aGlzLnMgPSB0aGlzLmdldENvbXBvbmVudChcIlNwaW5lXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnMuc2V0TWl4KCd3YWxrJywgJ2lkbGUnLCAwLjIpO1xuICAgICAgICAgICAgdGhpcy5zLnNldE1peCgnaWRsZScsICd3YWxrJywgMC4yKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uVXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLnAuZ2V0VmVsKCk7XG5cbiAgICAgICAgICAgIGlmKEtleU1hbmFnZXIuaXNLZXlEb3duKGNjLktFWS5sZWZ0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMucy5hbmltYXRpb24gPSAnd2Fsayc7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5zY2FsZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnNjYWxlWCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLnggLT0gdGhpcy5hY2NlbGVyYXRpb24gKiBkdDtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNwZWVkLnggPCAtdGhpcy5tYXhTcGVlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLnggPSAtdGhpcy5tYXhTcGVlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgZWxzZSBpZiAoS2V5TWFuYWdlci5pc0tleURvd24oY2MuS0VZLnJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMucy5hbmltYXRpb24gPSAnd2Fsayc7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5zY2FsZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnNjYWxlWCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLnggKz0gdGhpcy5hY2NlbGVyYXRpb24gKiBkdDtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNwZWVkLnggPiB0aGlzLm1heFNwZWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQueCA9IHRoaXMubWF4U3BlZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNwZWVkLnggIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHRoaXMuZHJhZypkdDtcbiAgICAgICAgICAgICAgICAgICAgaWYoTWF0aC5hYnModGhpcy5zcGVlZC54KSA8PSBkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zLmFuaW1hdGlvbiA9ICdpZGxlJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQueCAtPSB0aGlzLnNwZWVkLnggPiAwID8gZCA6IC1kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihNYXRoLmFicyh0aGlzLnNwZWVkLnkpIDwgMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuanVtcHMgICA9IDI7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmp1bXBzID4gMCAmJiBLZXlNYW5hZ2VyLmlzS2V5RG93bihjYy5LRVkudXAsIDAuMTUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZC55ID0gdGhpcy5qdW1wU3BlZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuanVtcGluZyAmJiBLZXlNYW5hZ2VyLmlzS2V5UmVsZWFzZShjYy5LRVkudXApKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wcy0tO1xuICAgICAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnAuc2V0VmVsKHRoaXMuc3BlZWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2ZvbGRlcl8gPSBcIlNjcmlwdFwiO1xuICAgIH1cblxuICAgIHZhciBSdW4gPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiUnVuXCIsIG5ldyBQYXJhbXMpO1xuXG4gICAgXG4gICAgZXhwb3J0cy5Db25zdHJ1Y3RvciA9IFJ1bjtcbiAgICBleHBvcnRzLlBhcmFtcyA9IFBhcmFtcztcbiAgICBcbn0pOyIsIi8qanNsaW50IHZhcnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlLCBkZXZlbDogdHJ1ZSwgbm9tZW46IHRydWUsIHJlZ2V4cDogdHJ1ZSwgaW5kZW50OiA0LCBtYXhlcnI6IDUwICovXG4vKmdsb2JhbCBjbCwgY2MqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBcbiAgICBjbC5EeW5hbWljTWVzaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9O1xuXG4gICAgdmFyIF9wID0gY2wuRHluYW1pY01lc2gucHJvdG90eXBlO1xuICAgIF9wLmNsZWFyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5faW5kaWNlcyA9IFtdO1xuICAgICAgICB0aGlzLl92ZXJ0cyA9IFtdO1xuXG4gICAgICAgIHRoaXMuX2NvbG9yID0gY2MuY29sb3IuV0hJVEU7XG4gICAgfTtcblxuICAgIF9wLmJ1aWxkID0gZnVuY3Rpb24oYU1lc2gpe1xuICAgICAgICBhTWVzaC52ZXJ0aWNlcyA9IHRoaXMuX3ZlcnRzO1xuICAgICAgICBhTWVzaC5yZWJpbmRWZXJ0aWNlcygpO1xuICAgIH07XG5cbiAgICBfcC5hZGRWZXJ0ZXggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFYLCBhWSwgYVosIGFVLCBhVjtcblxuICAgICAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSA1KXtcbiAgICAgICAgICAgIGFYID0gYXJndW1lbnRzWzBdOyBhWT1hcmd1bWVudHNbMV07IGFaPWFyZ3VtZW50c1syXTsgYVU9YXJndW1lbnRzWzNdOyBhVj1hcmd1bWVudHNbNF07XG4gICAgICAgIH0gZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09PSAzKXtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09IFwibnVtYmVyXCIpe1xuICAgICAgICAgICAgICAgIGFYID0gYXJndW1lbnRzWzBdOyBhWT1hcmd1bWVudHNbMV07IGFaPWFyZ3VtZW50c1syXTsgYVU9YVY9MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgYVggPSBhcmd1bWVudHNbMF0ueDsgYVk9YXJndW1lbnRzWzBdLnk7IGFaPWFyZ3VtZW50c1sxXTsgYVU9YXJndW1lbnRzWzJdLng7IGFWPWFyZ3VtZW50c1syXS55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IFxuLy8gICAgICAgIGVsc2UgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCl7XG4vL1xuLy8gICAgICAgIH1cblxuICAgICAgICAvLyBjYy5sb2coXCJ2ZXJ0ZXggOiAlZiwgJWYsICVmLCAlZiwgJWYgICAgICVpXCIsIGFYLCBhWSwgYVosIGFVLCBhViwgdGhpcy5fdmVydHMubGVuZ3RoKTtcbiAgICAgICAgdmFyIHYgPSBuZXcgY2MuVjNGX0M0Ql9UMkYoe3g6YVgseTphWSx6OmFafSwgdGhpcy5fY29sb3IsIHt1OmFVLHY6YVZ9KTtcbiAgICAgICAgdGhpcy5fdmVydHMucHVzaCh2KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcnRzLmxlbmd0aC0xO1xuICAgIH07XG5cbiAgICBfcC5hZGRGYWNlID0gZnVuY3Rpb24oYVYxLCBhVjIsIGFWMywgYVY0KSB7XG4gICAgICAgIHZhciBpbmRpY2VzID0gdGhpcy5faW5kaWNlcztcblxuICAgICAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAzKXtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYxKTtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYyKTtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYzKTtcbiAgICAgICAgfSBlbHNlIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYzKTtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYyKTtcbiAgICAgICAgICAgIGluZGljZXMucHVzaCAoYVYxKTtcblxuICAgICAgICAgICAgaW5kaWNlcy5wdXNoIChhVjQpO1xuICAgICAgICAgICAgaW5kaWNlcy5wdXNoIChhVjMpO1xuICAgICAgICAgICAgaW5kaWNlcy5wdXNoIChhVjEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9wLmdldEN1cnJlbnRUcmlhbmdsZUxpc3QgPSBmdW5jdGlvbihhU3RhcnQpIHtcbiAgICAgICAgYVN0YXJ0ID0gYVN0YXJ0ID8gYVN0YXJ0IDogMDtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSBhU3RhcnQ7IGkgPCB0aGlzLl9pbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLl9pbmRpY2VzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBfcC5fZ2V0VmVydENvdW50ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcnRzLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcInZlcnRDb3VudFwiLCBcIl9nZXRWZXJ0Q291bnRcIik7XG5cbn0pO1xuIiwiLypqc2xpbnQgdmFyczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIGRldmVsOiB0cnVlLCBub21lbjogdHJ1ZSwgcmVnZXhwOiB0cnVlLCBpbmRlbnQ6IDQsIG1heGVycjogNTAgKi9cbi8qZ2xvYmFsIGNsLCBjYyovXG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmYWN0b3J5KHJlcXVpcmUsIG1vZHVsZS5leHBvcnRzLCBtb2R1bGUpO1xuICAgIH0gZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmluZShmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbihyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBDb21wb25lbnQgPSByZXF1aXJlKFwiLi4vLi4vZnJhbWV3b3Jrcy9jb2NvczJkLWh0bWw1L2NvY29zbGl0ZS9jb21wb25lbnQvQ29tcG9uZW50LmpzXCIpO1xuXG4gICAgdmFyIFRlcnJhaW5GaWxsTW9kZSA9IGNsLkVudW0oXG4gICAgICAgIFwiVGVycmFpbkZpbGxNb2RlXCIsXG5cbiAgICAgICAgLy8gVGhlIGludGVyaW9yIG9mIHRoZSBwYXRoIHdpbGwgYmUgZmlsbGVkLCBhbmQgZWRnZXMgd2lsbCBiZSB0cmVhdGVkIGxpa2UgYSBwb2x5Z29uLlxuICAgICAgICBcIkNsb3NlZFwiLFxuICAgICAgICAvLyBEcm9wcyBzb21lIGV4dHJhIHZlcnRpY2VzIGRvd24sIGFuZCBmaWxsIHRoZSBpbnRlcmlvci4gRWRnZXMgb25seSBhcm91bmQgdGhlIHBhdGggaXRzZWxmLlxuICAgICAgICBcIlNraXJ0XCIsXG4gICAgICAgIC8vIERvZXNuJ3QgZmlsbCB0aGUgaW50ZXJpb3IgYXQgYWxsLiBKdXN0IGVkZ2VzLlxuICAgICAgICBcIk5vbmVcIixcbiAgICAgICAgLy8gRmlsbHMgdGhlIG91dHNpZGUgb2YgdGhlIHBhdGggcmF0aGVyIHRoYW4gdGhlIGludGVyaW9yLCBhbHNvIGludmVydHMgdGhlIGVkZ2VzLCB1cHNpZGUtZG93bi5cbiAgICAgICAgXCJJbnZlcnRlZENsb3NlZFwiXG4gICAgKTtcblxuICAgIHZhciBjdG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gcHJpdmF0ZVxuICAgICAgICB2YXIgcGF0aCA9IG51bGwsXG4gICAgICAgICAgICBtZXNoID0gbnVsbCxcbiAgICAgICAgICAgIHVuaXRzUGVyVVYgPSBjbC5wKDEsMSksXG4gICAgICAgICAgICB0ZXJyYWluTWF0ZXJpYWwgPSBuZXcgY2wuVGVycmFpbk1hdGVyaWFsKCksXG4gICAgICAgICAgICBkTWVzaCA9IG5ldyBjbC5EeW5hbWljTWVzaCgpO1xuXG4gICAgICAgIENvbXBvbmVudC5pbml0KHRoaXMsIHtcbiAgICAgICAgICAgIGZpbGw6IFRlcnJhaW5GaWxsTW9kZS5DbG9zZWQsXG4gICAgICAgICAgICBmaWxsWTogMCxcbiAgICAgICAgICAgIGZpbGxaOiAtMC41LFxuICAgICAgICAgICAgc3BsaXRDb3JuZXJzOiB0cnVlLFxuICAgICAgICAgICAgc21vb3RoUGF0aDogZmFsc2UsXG4gICAgICAgICAgICBzcGxpc3REaXN0OiA0LFxuICAgICAgICAgICAgcGl4ZWxzUGVyVW5pdDogMzIsXG4gICAgICAgICAgICB2ZXJ0ZXhDb2xvcjogY2MuY29sb3IuV2hpdGUsXG4gICAgICAgICAgICBjcmVhdGVDb2xsaWRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGRlcHRoOiA0LFxuICAgICAgICAgICAgc3VmYWNlT2Zmc2V0OiBbMCwwLDAsMF0sXG5cbiAgICAgICAgICAgIF9nZXRUZXJyYWluTWF0ZXJpYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXJyYWluTWF0ZXJpYWw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX3NldFRlcnJhaW5NYXRlcmlhbDogZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgICAgICAgIHRlcnJhaW5NYXRlcmlhbC5pbml0V2l0aEZpbGUoZmlsZSk7XG4gICAgICAgICAgICAgICAgdGVycmFpbk1hdGVyaWFsLm9uKCdsb2FkZWQnLCB0aGlzLnJlY3JlYXRlUGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHRvSlNPTnRlcnJhaW5NYXRlcmlhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRlcnJhaW5NYXRlcmlhbCA/IHRlcnJhaW5NYXRlcmlhbC5maWxlIDogXCJcIjtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlY3JlYXRlUGF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGwgPSB0aGlzLmZpbGw7XG5cbiAgICAgICAgICAgICAgICBwYXRoID0gdGhpcy5nZXRDb21wb25lbnQoXCJUZXJyYWluUGF0aENvbXBvbmVudFwiKTtcbiAgICAgICAgICAgICAgICBtZXNoID0gdGhpcy5nZXRDb21wb25lbnQoXCJNZXNoQ29tcG9uZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgaWYoIXRlcnJhaW5NYXRlcmlhbCB8fCB0ZXJyYWluTWF0ZXJpYWwubG9hZGluZyB8fCAhbWVzaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG1lc2gubWF0ZXJpYWxzLmxlbmd0aCA9PT0gMCB8fCBtZXNoLm1hdGVyaWFsc1swXS5maWxlICE9PSB0ZXJyYWluTWF0ZXJpYWwuZWRnZU1hdGVyaWFsLmZpbGUgfHwgbWVzaC5tYXRlcmlhbHNbMV0uZmlsZSAhPT0gdGVycmFpbk1hdGVyaWFsLmZpbGxNYXRlcmlhbC5maWxlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzaC5tYXRlcmlhbHMuc2V0KDAsIHRlcnJhaW5NYXRlcmlhbC5maWxsTWF0ZXJpYWwpO1xuICAgICAgICAgICAgICAgICAgICBtZXNoLm1hdGVyaWFscy5zZXQoMSwgdGVycmFpbk1hdGVyaWFsLmVkZ2VNYXRlcmlhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJyYWluTWF0ZXJpYWwuaGFzKGNsLkVudW0uVGVycmFpbkRpcmVjdGlvbi5MZWZ0KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIXRlcnJhaW5NYXRlcmlhbC5oYXMoY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLlJpZ2h0KSlcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGxpdENvcm5lcnMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuc3BsaXRDb3JuZXJzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRNZXNoLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgaWYocGF0aC5jb3VudCA8IDIpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudChcIk1lc2hDb21wb25lbnRcIikuZmlsZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl91bml0c1BlclVWID0gY2wucCg1LjMzMzMzLCA1LjMzMzMzKTtcblxuICAgICAgICAgICAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICBzZWdtZW50cyA9IHRoaXMuX2dldFNlZ21lbnRzKHBhdGguZ2V0VmVydHModGhpcy5zbW9vdGhQYXRoLCB0aGlzLnNwbGlzdERpc3QsIHRoaXMuc3BsaXRDb3JuZXJzKSk7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkMSA9IHNlbGYuX2dldERlc2NyaXB0aW9uKGEpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZDIgPSBzZWxmLl9nZXREZXNjcmlwdGlvbihiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQyLnpPZmZzZXQgPCBkMS56T2Zmc2V0O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRTZWdtZW50IChzZWdtZW50c1tpXSwgc2VnbWVudHMubGVuZ3RoIDw9IDEgJiYgcGF0aC5jbG9zZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgc3VibWVzaDEgPSBkTWVzaC5nZXRDdXJyZW50VHJpYW5nbGVMaXN0KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBmaWxsIGlmIHRoZSB1c2VyIGRlc2lyZXNcbiAgICAgICAgICAgICAgICBpZiAoZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLlNraXJ0ICYmIHRlcnJhaW5NYXRlcmlhbC5maWxsTWF0ZXJpYWwgIT09IG51bGwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRGaWxsKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgoZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkNsb3NlZCB8fCBmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQpICYmIHRlcnJhaW5NYXRlcmlhbC5maWxsTWF0ZXJpYWwgIT09IG51bGwpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRGaWxsKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICBlbHNlIGlmIChmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuTm9uZSkgeyB9XG4gICAgICAgICAgICAgICAgdmFyIHN1Ym1lc2gyID0gZE1lc2guZ2V0Q3VycmVudFRyaWFuZ2xlTGlzdChzdWJtZXNoMS5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgbWVzaC5zZXRTdWJNZXNoKDEsIHN1Ym1lc2gxKTtcbiAgICAgICAgICAgICAgICBtZXNoLnNldFN1Yk1lc2goMCwgc3VibWVzaDIpO1xuICAgICAgICAgICAgICAgIGRNZXNoLmJ1aWxkKG1lc2gpO1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jcmVhdGVDb2xsaWRlcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcG9seSA9IHRoaXMuZ2V0Q29tcG9uZW50KCdQaHlzaWNzUG9seScpO1xuICAgICAgICAgICAgICAgICAgICBpZighcG9seSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9seSA9IHRoaXMuYWRkQ29tcG9uZW50KCdQaHlzaWNzUG9seScpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcG9seS52ZXJ0cyA9IHBhdGgucGF0aFZlcnRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIHByaXZhdGUgZnVuY3Rpb25cblxuICAgICAgICAgICAgX2dldERlc2NyaXB0aW9uOiBmdW5jdGlvbiAoYVNlZ21lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlyID0gcGF0aC5nZXREaXJlY3Rpb25XaXRoU2VnbWVudChhU2VnbWVudCwgMCwgdGhpcy5maWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXJyYWluTWF0ZXJpYWwuZ2V0RGVzY3JpcHRvcihkaXIpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgX2dldFNlZ21lbnRzOiBmdW5jdGlvbiAoYVBhdGgpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHNlZ21lbnRzID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3BsaXRDb3JuZXJzKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMgPSBwYXRoLmdldFNlZ21lbnRzKGFQYXRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChhUGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmNsb3NlZCAmJiB0aGlzLnNtb290aFBhdGggPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5jbG9zZUVuZHMoc2VnbWVudHMsIHRoaXMuc3BsaXRDb3JuZXJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgX2FkZFNlZ21lbnQ6IGZ1bmN0aW9uKGFTZWdtZW50LCBhQ2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVuaXRzUGVyVVYgID0gdGhpcy5fdW5pdHNQZXJVVjtcbiAgICAgICAgICAgICAgICB2YXIgZmlsbCAgICAgICAgPSB0aGlzLmZpbGw7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGVzYyAgICAgICAgPSB0aGlzLl9nZXREZXNjcmlwdGlvbihhU2VnbWVudCk7XG4gICAgICAgICAgICAgICAgdmFyIGJvZHlJRCAgICAgID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGRlc2MuYm9keS5sZW5ndGgtMSkpO1xuICAgICAgICAgICAgICAgIHZhciBib2R5ICAgICAgICA9IHRlcnJhaW5NYXRlcmlhbC50b1VWKCBkZXNjLmJvZHlbYm9keUlEXSApO1xuICAgICAgICAgICAgICAgIHZhciBib2R5V2lkdGggICA9IGJvZHkud2lkdGggKiB1bml0c1BlclVWLng7XG5cbiAgICAgICAgICAgICAgICAvLyBpbnQgdFNlZWQgPSBVbml0eUVuZ2luZS5SYW5kb20uc2VlZDtcblxuICAgICAgICAgICAgICAgIHZhciBjYXBMZWZ0U2xpZGVEaXIgID0gYVNlZ21lbnRbMV0uc3ViKGFTZWdtZW50WzBdKTtcbiAgICAgICAgICAgICAgICB2YXIgY2FwUmlnaHRTbGlkZURpciA9IGFTZWdtZW50W2FTZWdtZW50Lmxlbmd0aC0yXS5zdWIoYVNlZ21lbnRbYVNlZ21lbnQubGVuZ3RoLTFdKTtcbiAgICAgICAgICAgICAgICBjYXBMZWZ0U2xpZGVEaXIgID0gY2MucE5vcm1hbGl6ZShjYXBMZWZ0U2xpZGVEaXIpO1xuICAgICAgICAgICAgICAgIGNhcFJpZ2h0U2xpZGVEaXIgPSBjYy5wTm9ybWFsaXplKGNhcFJpZ2h0U2xpZGVEaXIpO1xuICAgICAgICAgICAgICAgIGFTZWdtZW50WzAgICAgICAgICAgICAgICAgXS5zdWJUb1NlbGYoY2MucE11bHQoY2FwTGVmdFNsaWRlRGlyLCAgZGVzYy5jYXBPZmZzZXQpKTtcbiAgICAgICAgICAgICAgICBhU2VnbWVudFthU2VnbWVudC5sZW5ndGgtMV0uc3ViVG9TZWxmKGNjLnBNdWx0KGNhcFJpZ2h0U2xpZGVEaXIsIGRlc2MuY2FwT2Zmc2V0KSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFTZWdtZW50Lmxlbmd0aC0xOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vcm0xICAgPSBjbC5wKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3JtMiAgID0gY2wucCgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgICBsZW5ndGggID0gY2MucERpc3RhbmNlKGFTZWdtZW50W2krMV0sIGFTZWdtZW50W2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICAgcmVwZWF0cyA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IobGVuZ3RoIC8gYm9keVdpZHRoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbm9ybTEgPSBwYXRoLmdldE5vcm1hbChhU2VnbWVudCwgaSwgICBhQ2xvc2VkKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybTIgPSBwYXRoLmdldE5vcm1hbChhU2VnbWVudCwgaSsxLCBhQ2xvc2VkKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMTsgdCA8IHJlcGVhdHMrMTsgdCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVbml0eUVuZ2luZS5SYW5kb20uc2VlZCA9IChpbnQpKHRyYW5zZm9ybS5wb3NpdGlvbi54ICogMTAwMDAwICsgdHJhbnNmb3JtLnBvc2l0aW9uLnkgKiAxMDAwMCArIGkgKiAxMDAgKyB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlJRCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChkZXNjLmJvZHkubGVuZ3RoLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkgICA9IHRoaXMudGVycmFpbk1hdGVyaWFsLnRvVVYoIGRlc2MuYm9keVtib2R5SURdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zMSwgcG9zMiwgbjEsIG4yO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MxID0gY2wuUG9pbnQubGVycChhU2VnbWVudFtpXSwgYVNlZ21lbnRbaSArIDFdLCAodCAtIDEpIC8gcmVwZWF0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3MyID0gY2wuUG9pbnQubGVycChhU2VnbWVudFtpXSwgYVNlZ21lbnRbaSArIDFdLCB0IC8gcmVwZWF0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuMSAgID0gY2wuUG9pbnQubGVycChub3JtMSwgbm9ybTIsICh0IC0gMSkgLyByZXBlYXRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4yICAgPSBjbC5Qb2ludC5sZXJwKG5vcm0xLCBub3JtMiwgdCAvIHJlcGVhdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCAgICA9IChib2R5LmhlaWdodCAvIDIpICogdW5pdHNQZXJVVi55O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHlPZmYgPSBmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyAtZGVzYy55T2Zmc2V0IDogZGVzYy55T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICAgdjEgPSBkTWVzaC5hZGRWZXJ0ZXgocG9zMS54ICsgbjEueCAqIChkICsgeU9mZiksIHBvczEueSArIG4xLnkgKiAoZCArIHlPZmYpLCBkZXNjLnpPZmZzZXQsIGJvZHkueCwgICAgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gYm9keS55TWF4IDogYm9keS55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAgIHYyID0gZE1lc2guYWRkVmVydGV4KHBvczEueCAtIG4xLnggKiAoZCAtIHlPZmYpLCBwb3MxLnkgLSBuMS55ICogKGQgLSB5T2ZmKSwgZGVzYy56T2Zmc2V0LCBib2R5LngsICAgIGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IGJvZHkueSAgICA6IGJvZHkueU1heCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgICB2MyA9IGRNZXNoLmFkZFZlcnRleChwb3MyLnggKyBuMi54ICogKGQgKyB5T2ZmKSwgcG9zMi55ICsgbjIueSAqIChkICsgeU9mZiksIGRlc2Muek9mZnNldCwgYm9keS54TWF4LCBmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyBib2R5LnlNYXggOiBib2R5LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICAgdjQgPSBkTWVzaC5hZGRWZXJ0ZXgocG9zMi54IC0gbjIueCAqIChkIC0geU9mZiksIHBvczIueSAtIG4yLnkgKiAoZCAtIHlPZmYpLCBkZXNjLnpPZmZzZXQsIGJvZHkueE1heCwgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gYm9keS55ICAgIDogYm9keS55TWF4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRNZXNoLmFkZEZhY2UodjEsIHYzLCB2NCwgdjIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghYUNsb3NlZClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZENhcChhU2VnbWVudCwgZGVzYywgLTEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRDYXAoYVNlZ21lbnQsIGRlc2MsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbml0eUVuZ2luZS5SYW5kb20uc2VlZCA9IHRTZWVkO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgX2FkZENhcDogZnVuY3Rpb24gKGFTZWdtZW50LCBhRGVzYywgYURpcikge1xuICAgICAgICAgICAgICAgIHZhciB1bml0c1BlclVWICA9IHRoaXMuX3VuaXRzUGVyVVY7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGwgICAgICAgID0gdGhpcy5maWxsO1xuXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgZGlyICAgPSBjbC5wKCk7XG4gICAgICAgICAgICAgICAgaWYgKGFEaXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZGlyICAgPSBhU2VnbWVudFswXS5zdWIoYVNlZ21lbnRbMV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gYVNlZ21lbnQubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgICAgIGRpciAgID0gYVNlZ21lbnRbYVNlZ21lbnQubGVuZ3RoLTFdLnN1YihhU2VnbWVudFthU2VnbWVudC5sZW5ndGgtMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkaXIubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgdmFyIG5vcm0gPSBwYXRoLmdldE5vcm1hbChhU2VnbWVudCwgaW5kZXgsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB2YXIgcG9zICA9IGFTZWdtZW50W2luZGV4XTtcbiAgICAgICAgICAgICAgICB2YXIgICAgbENhcCA9IGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IHRlcnJhaW5NYXRlcmlhbC50b1VWKGFEZXNjLnJpZ2h0Q2FwKSA6IHRlcnJhaW5NYXRlcmlhbC50b1VWKGFEZXNjLmxlZnRDYXApO1xuICAgICAgICAgICAgICAgIHZhciAgICByQ2FwID0gZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gdGVycmFpbk1hdGVyaWFsLnRvVVYoYURlc2MubGVmdENhcCApIDogdGVycmFpbk1hdGVyaWFsLnRvVVYoYURlc2MucmlnaHRDYXApO1xuICAgICAgICAgICAgICAgIHZhciAgICB5T2ZmID0gZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gLWFEZXNjLnlPZmZzZXQgOiBhRGVzYy55T2Zmc2V0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGFEaXIgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9ICBsQ2FwLndpZHRoICAgICAqIHVuaXRzUGVyVVYueDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjYWxlID0gKGxDYXAuaGVpZ2h0LzIpICogdW5pdHNQZXJVVi55O1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2MSA9IGRNZXNoLmFkZFZlcnRleChwb3MuYWRkKGRpci5tdWx0KHdpZHRoKSkuYWRkKG5vcm0ubXVsdChzY2FsZSArIHlPZmYpKSwgYURlc2Muek9mZnNldCwgY2wucChmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQ/IGxDYXAueE1heCA6IGxDYXAueCwgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gbENhcC55TWF4IDogbENhcC55KSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2MiA9IGRNZXNoLmFkZFZlcnRleChwb3MuYWRkKG5vcm0ubXVsdChzY2FsZSArIHlPZmYpKSwgYURlc2Muek9mZnNldCwgY2wucChmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyBsQ2FwLnggOiBsQ2FwLnhNYXgsIGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IGxDYXAueU1heCA6IGxDYXAueSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2MyA9IGRNZXNoLmFkZFZlcnRleChwb3Muc3ViKG5vcm0ubXVsdChzY2FsZSAtIHlPZmYpKSwgYURlc2Muek9mZnNldCwgY2MucChmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyBsQ2FwLnggOiBsQ2FwLnhNYXgsIGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IGxDYXAueSA6IGxDYXAueU1heCkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdjQgPSBkTWVzaC5hZGRWZXJ0ZXgocG9zLmFkZChkaXIubXVsdCh3aWR0aCkpLnN1Yihub3JtLm11bHQoc2NhbGUgLSB5T2ZmKSksIGFEZXNjLnpPZmZzZXQsIGNsLnAoZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gbENhcC54TWF4IDogbENhcC54LCBmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyBsQ2FwLnkgOiBsQ2FwLnlNYXgpKTtcbiAgICAgICAgICAgICAgICAgICAgZE1lc2guYWRkRmFjZSh2MSwgdjIsIHYzLCB2NCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gIHJDYXAud2lkdGggICAgICogdW5pdHNQZXJVVi54O1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2NhbGUgPSAockNhcC5oZWlnaHQvMikgKiB1bml0c1BlclVWLnk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHYxID0gZE1lc2guYWRkVmVydGV4KHBvcy5hZGQoZGlyLm11bHQod2lkdGgpKS5hZGQobm9ybS5tdWx0KHNjYWxlICsgeU9mZikpLCBhRGVzYy56T2Zmc2V0LCBjbC5wKGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IHJDYXAueCA6IHJDYXAueE1heCwgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gckNhcC55TWF4IDogckNhcC55KSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2MiA9IGRNZXNoLmFkZFZlcnRleChwb3MuYWRkKG5vcm0ubXVsdChzY2FsZSArIHlPZmYpKSwgICAgICAgICAgICAgICBhRGVzYy56T2Zmc2V0LCBjbC5wKGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IHJDYXAueE1heCA6IHJDYXAueCwgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gckNhcC55TWF4IDogckNhcC55KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHYzID0gZE1lc2guYWRkVmVydGV4KHBvcy5zdWIobm9ybS5tdWx0KHNjYWxlIC0geU9mZikpLCAgICAgICAgICAgICAgIGFEZXNjLnpPZmZzZXQsIGNsLnAoZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gckNhcC54TWF4IDogckNhcC54LCBmaWxsID09PSBUZXJyYWluRmlsbE1vZGUuSW52ZXJ0ZWRDbG9zZWQgPyByQ2FwLnkgOiByQ2FwLnlNYXgpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHY0ID0gZE1lc2guYWRkVmVydGV4KHBvcy5hZGQoZGlyLm11bHQod2lkdGgpKS5zdWIobm9ybS5tdWx0KHNjYWxlIC0geU9mZikpLCBhRGVzYy56T2Zmc2V0LCBjbC5wKGZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCA/IHJDYXAueCA6IHJDYXAueE1heCwgZmlsbCA9PT0gVGVycmFpbkZpbGxNb2RlLkludmVydGVkQ2xvc2VkID8gckNhcC55IDogckNhcC55TWF4KSk7XG4gICAgICAgICAgICAgICAgICAgIGRNZXNoLmFkZEZhY2UodjQsIHYzLCB2MiwgdjEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIF9hZGRGaWxsOiBmdW5jdGlvbiAoYVNraXJ0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmlsbFZlcnRzID0gcGF0aC5nZXRWZXJ0cyh0aGlzLnNtb290aFBhdGgsIHRoaXMuc3BsaXN0RGlzdCwgdGhpcy5zcGxpdENvcm5lcnMpO1xuICAgICAgICAgICAgICAgIHZhciBzY2FsZSAgICAgPSBjbC5wKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzY2FsZSBpcyBkaWZmZXJlbnQgZm9yIHRoZSBmaWxsIHRleHR1cmVcbiAgICAgICAgICAgICAgICBpZiAodGVycmFpbk1hdGVyaWFsLmZpbGxNYXRlcmlhbCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gY2MucChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlcnJhaW5NYXRlcmlhbC5maWxsTWF0ZXJpYWwud2lkdGggIC8gdGhpcy5waXhlbHNQZXJVbml0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVycmFpbk1hdGVyaWFsLmZpbGxNYXRlcmlhbC5oZWlnaHQgLyB0aGlzLnBpeGVsc1BlclVuaXQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhU2tpcnQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBmaWxsVmVydHNbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmQgICA9IGZpbGxWZXJ0c1tmaWxsVmVydHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsbFZlcnRzLnB1c2goY2wucChlbmQueCwgdGhpcy5maWxsWSkpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsVmVydHMucHVzaChjbC5wKE1hdGgubGVycChlbmQueCwgc3RhcnQueCwgMC4zMyksIHRoaXMuZmlsbFkpKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFZlcnRzLnB1c2goY2wucChNYXRoLmxlcnAoZW5kLngsIHN0YXJ0LngsIDAuNjYpLCB0aGlzLmZpbGxZKSk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxWZXJ0cy5wdXNoKGNsLnAoc3RhcnQueCwgdGhpcy5maWxsWSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgID0gZE1lc2gudmVydENvdW50O1xuICAgICAgICAgICAgICAgIHZhciBpbmRpY2VzID0gY2wuVHJpYW5ndWxhdG9yLmdldEluZGljZXMoZmlsbFZlcnRzLCB0cnVlLCB0aGlzLmZpbGwgPT09IFRlcnJhaW5GaWxsTW9kZS5JbnZlcnRlZENsb3NlZCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxsVmVydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZE1lc2guYWRkVmVydGV4KGZpbGxWZXJ0c1tpXS54LCBmaWxsVmVydHNbaV0ueSwgdGhpcy5maWxsWiwgZmlsbFZlcnRzW2ldLnggLyBzY2FsZS54LCBmaWxsVmVydHNbaV0ueSAvIHNjYWxlLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpKz0zKSB7XG4gICAgICAgICAgICAgICAgICAgIGRNZXNoLmFkZEZhY2UoaW5kaWNlc1tpXSArIG9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzW2krMV0gKyBvZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlc1tpKzJdICsgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcblxuICAgICAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIodGhpcywgXCJ0ZXJyYWluTWF0ZXJpYWxcIiwgXCJfZ2V0VGVycmFpbk1hdGVyaWFsXCIsIFwiX3NldFRlcnJhaW5NYXRlcmlhbFwiKTtcblxuICAgICAgICB0aGlzLl9zdXBlcihbXCJNZXNoQ29tcG9uZW50XCIsIFwiVGVycmFpblBhdGhDb21wb25lbnRcIl0pO1xuICAgIH1cblxuICAgIHZhciBUZXJyYWluQ29tcG9uZW50ID0gQ29tcG9uZW50LmV4dGVuZENvbXBvbmVudChcIlRlcnJhaW5Db21wb25lbnRcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBbXCJmaWxsXCIsIFwiZmlsbFlcIiwgXCJmaWxsWlwiLCBcInNwbGl0Q29ybmVyc1wiLCBcInNtb290aFBhdGhcIiwgXCJzcGxpc3REaXN0XCIsIFxuICAgICAgICAgICAgICAgICAgICBcInBpeGVsc1BlclVuaXRcIiwgXCJ2ZXJ0ZXhDb2xvclwiLCBcImNyZWF0ZUNvbGxpZGVyXCIsIFwidGVycmFpbk1hdGVyaWFsXCJdLFxuXG4gICAgICAgIGN0b3I6IGN0b3IsXG5cbiAgICAgICAgX2ZvbGRlcl8gOiAgXCJ0ZXJyYWluXCJcbiAgICB9KTtcblxuXG4gICAgZXhwb3J0cy5QYXJhbXMgPSBjdG9yO1xuICAgIGV4cG9ydHMuQ29tcG9uZW50ID0gVGVycmFpbkNvbXBvbmVudDtcblxufSk7XG4iLCIvKmpzbGludCB2YXJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgZGV2ZWw6IHRydWUsIG5vbWVuOiB0cnVlLCByZWdleHA6IHRydWUsIGluZGVudDogNCwgbWF4ZXJyOiA1MCAqL1xuLypnbG9iYWwgY2wsIGNjKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSwgbW9kdWxlLmV4cG9ydHMsIG1vZHVsZSk7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuXG4gICAgdmFyIEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoXCIuLi8uLi9mcmFtZXdvcmtzL2NvY29zMmQtaHRtbDUvY29jb3NsaXRlL3V0aWxzL0V2ZW50RGlzcGF0Y2hlci5qc1wiKTtcbiAgICB2YXIgU2VyaWFsaXphdGlvbiAgID0gcmVxdWlyZShcIi4uLy4uL2ZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvdXRpbHMvU2VyaWFsaXphdGlvbi5qc1wiKTtcblxuICAgIHZhciBUZXJyYWluRGlyZWN0aW9uID0gY2wuRW51bSgnVGVycmFpbkRpcmVjdGlvbicsICdUb3AnLCAnTGVmdCcsICdSaWdodCcsICdCb3R0b20nKTtcblxuICAgIGNsLlRlcnJhaW5TZWdtZW50RGVzY3JpcHRpb24gPSBmdW5jdGlvbihhcHBseVRvKSB7XG4gICAgICAgIHRoaXMuek9mZnNldCA9IDA7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IDA7XG4gICAgICAgIHRoaXMuY2FwT2Zmc2V0ID0gMDtcbiAgICAgICAgdGhpcy5hcHBseVRvID0gYXBwbHlUbyA/IGFwcGx5VG8gOiBUZXJyYWluRGlyZWN0aW9uLlRvcDtcbiAgICB9O1xuXG5cbiAgICBjbC5UZXJyYWluTWF0ZXJpYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmlsbE1hdGVyaWFsRmlsZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuX2VkZ2VNYXRlcmlhbEZpbGUgPSBcIlwiO1xuXG4gICAgICAgIHRoaXMuX2ZpbGxNYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2VkZ2VNYXRlcmlhbCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5kZXNjcmlwdG9ycyA9IFtdO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgVGVycmFpbkRpcmVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzY3JpcHRvcnMucHVzaChuZXcgY2wuVGVycmFpblNlZ21lbnREZXNjcmlwdGlvbih2YWx1ZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBFdmVudERpc3BhdGNoZXIubWFrZUV2ZW50RGlzcGF0Y2hlcih0aGlzKTtcbiAgICB9O1xuXG4gICAgdmFyIF9wID0gY2wuVGVycmFpbk1hdGVyaWFsLnByb3RvdHlwZTtcblxuICAgIF9wLl9nZXRGaWxsTWF0ZXJpYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbE1hdGVyaWFsO1xuICAgIH07XG4gICAgXG4gICAgX3AuX3NldEZpbGxNYXRlcmlhbCA9IGZ1bmN0aW9uKHRleHR1cmUpe1xuICAgICAgICBpZih0ZXh0dXJlICYmIChjYy5pc1N0cmluZyh0ZXh0dXJlKSkpe1xuICAgICAgICAgICAgaWYodGV4dHVyZSA9PT0gdGhpcy5fZmlsbE1hdGVyaWFsRmlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZmlsbE1hdGVyaWFsRmlsZSA9IHRleHR1cmU7XG4gICAgICAgICAgICB0aGlzLl9maWxsTWF0ZXJpYWwgPSBjYy50ZXh0dXJlQ2FjaGUuYWRkSW1hZ2UodGV4dHVyZSk7XG4gICAgICAgICAgICB0aGlzLl9maWxsTWF0ZXJpYWwuZmlsZSA9IHRleHR1cmU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3AuX2dldEVkZ2VNYXRlcmlhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lZGdlTWF0ZXJpYWw7XG4gICAgfTtcbiAgICBcbiAgICBfcC5fc2V0RWRnZU1hdGVyaWFsID0gZnVuY3Rpb24odGV4dHVyZSl7XG4gICAgICAgIGlmKHRleHR1cmUgJiYgKGNjLmlzU3RyaW5nKHRleHR1cmUpKSl7XG4gICAgICAgICAgICBpZih0ZXh0dXJlID09PSB0aGlzLl9lZGdlTWF0ZXJpYWxGaWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lZGdlTWF0ZXJpYWxGaWxlID0gdGV4dHVyZTtcbiAgICAgICAgICAgIHRoaXMuX2VkZ2VNYXRlcmlhbCA9IGNjLnRleHR1cmVDYWNoZS5hZGRJbWFnZSh0ZXh0dXJlKTtcbiAgICAgICAgICAgIHRoaXMuX2VkZ2VNYXRlcmlhbC5maWxlID0gdGV4dHVyZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfcC5nZXREZXNjcmlwdG9yID0gZnVuY3Rpb24oYURpcmVjdGlvbikge1xuICAgICAgICB2YXIgZGVzY3JpcHRvcnMgPSB0aGlzLmRlc2NyaXB0b3JzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlc2NyaXB0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcnNbaV0uYXBwbHlUbyA9PT0gYURpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdG9yc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzY3JpcHRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3JzWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgY2wuVGVycmFpblNlZ21lbnREZXNjcmlwdGlvbigpO1xuICAgIH07XG5cbiAgICBfcC50b1VWID0gZnVuY3Rpb24oYVBpeGVsVVZzKSB7XG4gICAgICAgIGlmKCFhUGl4ZWxVVnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGdlTWF0ZXJpYWwgPSB0aGlzLmVkZ2VNYXRlcmlhbDtcbiAgICAgICAgaWYgKGVkZ2VNYXRlcmlhbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGFQaXhlbFVWcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVjdCA9IG5ldyBjYy5yZWN0KFxuICAgICAgICAgICAgYVBpeGVsVVZzLnggICAgICAgIC8gZWRnZU1hdGVyaWFsLndpZHRoLFxuICAgICAgICAgICAgYVBpeGVsVVZzLnkgXHQgICAvIGVkZ2VNYXRlcmlhbC5oZWlnaHQsXG4gICAgICAgICAgICBhUGl4ZWxVVnMud2lkdGggICAgLyBlZGdlTWF0ZXJpYWwud2lkdGgsXG4gICAgICAgICAgICBhUGl4ZWxVVnMuaGVpZ2h0ICAgLyBlZGdlTWF0ZXJpYWwuaGVpZ2h0KTtcblxuICAgICAgICByZWN0LnhNYXggPSByZWN0LnggKyByZWN0LndpZHRoO1xuICAgICAgICByZWN0LnlNYXggPSByZWN0LnkgKyByZWN0LmhlaWdodDtcbiAgICAgICAgcmV0dXJuIHJlY3Q7XG4gICAgfTtcblxuICAgIF9wLmhhcyA9IGZ1bmN0aW9uKGFEaXJlY3Rpb24pe1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGVzY3JpcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlc2NyaXB0b3JzW2ldLmFwcGx5VG8gPT09IGFEaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XHRcbiAgICB9O1xuXG5cbiAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwiZmlsbE1hdGVyaWFsXCIsIFwiX2dldEZpbGxNYXRlcmlhbFwiLCBcIl9zZXRGaWxsTWF0ZXJpYWxcIik7XG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcImVkZ2VNYXRlcmlhbFwiLCBcIl9nZXRFZGdlTWF0ZXJpYWxcIiwgXCJfc2V0RWRnZU1hdGVyaWFsXCIpO1xuXG4gICAgY2wuVGVycmFpbk1hdGVyaWFsLnByb3RvdHlwZS5pbml0V2l0aEZpbGUgPSBmdW5jdGlvbihmaWxlLCBjYil7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBpZihmaWxlICYmIHRoaXMuZmlsZSAhPT0gZmlsZSl7XG5cbiAgICAgICAgICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgICAgICAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gY2MubG9hZGVyLmdldFVybChjYy5sb2FkZXIucmVzUGF0aCwgZmlsZSk7XG4gICAgICAgICAgICBjYy5sb2FkZXIubG9hZEpzb24odXJsLCBmdW5jdGlvbihlcnIsIGpzb24pe1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5pbml0V2l0aEpzb24oanNvbik7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkaW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJsb2FkZWRcIik7XG5cbiAgICAgICAgICAgICAgICBpZihjYikge1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIFNlcmlhbGl6YXRpb24udHJ5UmV2aXZlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY2wuVGVycmFpbk1hdGVyaWFsLnByb3RvdHlwZS5pbml0V2l0aEpzb24gPSBmdW5jdGlvbihqc29uKXtcblxuICAgICAgICB0aGlzLmZpbGxNYXRlcmlhbCA9IGpzb24uZmlsbE1hdGVyaWFsO1xuICAgICAgICB0aGlzLmVkZ2VNYXRlcmlhbCA9IGpzb24uZWRnZU1hdGVyaWFsO1xuICAgICAgICB0aGlzLmRlc2NyaXB0b3JzICA9IGpzb24uZGVzY3JpcHRvcnM7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn0pOyIsIi8qanNsaW50IHZhcnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlLCBkZXZlbDogdHJ1ZSwgbm9tZW46IHRydWUsIHJlZ2V4cDogdHJ1ZSwgaW5kZW50OiA0LCBtYXhlcnI6IDUwICovXG4vKmdsb2JhbCBjbCwgY2MqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlLCBtb2R1bGUuZXhwb3J0cywgbW9kdWxlKTtcbiAgICB9IGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24ocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gcmVxdWlyZShcIi4uLy4uL2ZyYW1ld29ya3MvY29jb3MyZC1odG1sNS9jb2Nvc2xpdGUvY29tcG9uZW50L0NvbXBvbmVudC5qc1wiKTtcbiAgICBcbiAgICB2YXIgVGVycmFpblBhdGhDb21wb25lbnQgPSBDb21wb25lbnQuZXh0ZW5kQ29tcG9uZW50KFwiVGVycmFpblBhdGhDb21wb25lbnRcIiwge1xuICAgICAgICBwcm9wZXJ0aWVzOiBbXCJjbG9zZWRcIiwgXCJwYXRoVmVydHNcIl0sXG4gICAgICAgIFxuICAgICAgICBjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMuY2xvc2VkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9wYXRoVmVydHMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0UGF0aFZlcnRzOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhdGhWZXJ0cztcbiAgICAgICAgfSxcbiAgICAgICAgX3NldFBhdGhWZXJ0czogZnVuY3Rpb24odmVydHMpe1xuICAgICAgICAgICAgdGhpcy5fcGF0aFZlcnRzLnNwbGljZSgwLCB0aGlzLl9wYXRoVmVydHMubGVuZ3RoKTtcblxuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGk8dmVydHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhdGhWZXJ0cy5wdXNoKGNsLnAodmVydHNbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Q291bnQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXRoVmVydHMubGVuZ3RoO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHRvZG9cbiAgICAgICAgcmVDZW50ZXI6IGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICAgICB2YXIgY2VudGVyID0gY2MucCgwLDApO1xuLy8gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gdGhpcy5nZXRDb21wb25lbnQoXCJUcmFuc2Zvcm1Db21wb25lbnRcIik7XG4vL1xuLy8gICAgICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLnBhdGhWZXJ0cy5sZW5ndGg7IGkrKyl7XG4vLyAgICAgICAgICAgICAgICBjZW50ZXIuYWRkVG9TZWxmKHRoaXMucGF0aFZlcnRzW2ldKTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICBjZW50ZXIgPSBjZW50ZXIuZGl2aWRlKHRoaXMucGF0aFZlcnRzLmxlbmd0aCkuYWRkKGNjLnAodC54LCB0LnkpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWZXJ0czogZnVuY3Rpb24gKGFTbW9vdGhlZCwgYVNwbGl0RGlzdGFuY2UsIGFTcGxpdENvcm5lcnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlmIChhU21vb3RoZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRWZXJ0c1Ntb290aGVkKGFTcGxpdERpc3RhbmNlLCBhU3BsaXRDb3JuZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZlcnRzUmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmVydHNSYXc6IGZ1bmN0aW9uICgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpPHRoaXMucGF0aFZlcnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjbC5wKHRoaXMucGF0aFZlcnRzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZlcnRzU21vb3RoZWQ6IGZ1bmN0aW9uKGFTcGxpdERpc3RhbmNlLCBhU3BsaXRDb3JuZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgY2xvc2VkID0gdGhpcy5jbG9zZWQ7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBpZiAoYVNwbGl0Q29ybmVycylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VnbWVudHMgPSB0aGlzLmdldFNlZ21lbnRzKHRoaXMucGF0aFZlcnRzKTtcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VFbmRzKHNlZ21lbnRzLCBhU3BsaXRDb3JuZXJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50c1tpXSA9IHRoaXMuc21vb3RoU2VnbWVudChzZWdtZW50c1tpXSwgYVNwbGl0RGlzdGFuY2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IDAgJiYgc2VnbWVudHNbaV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzW2ldLnNwbGljZSgwLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGo9MDsgajxzZWdtZW50c1tpXS5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goc2VnbWVudHNbaV1bal0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuc21vb3RoU2VnbWVudCh0aGlzLnBhdGhWZXJ0cywgYVNwbGl0RGlzdGFuY2UsIGNsb3NlZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMucGF0aFZlcnRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLnNtb290aFNlZ21lbnQodGhpcy5wYXRoVmVydHMsIGFTcGxpdERpc3RhbmNlLCBjbG9zZWQpO1xuICAgICAgICAgICAgICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5wYXRoVmVydHNbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2xvc2VzdFNlZzogZnVuY3Rpb24gKGFQb2ludClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHBhdGhWZXJ0cyA9IHRoaXMucGF0aFZlcnRzO1xuICAgICAgICAgICAgdmFyIGNsb3NlZCA9IHRoaXMuY2xvc2VkO1xuXG4gICAgICAgICAgICB2YXIgZGlzdCAgPSAxMDAwMDAwMDA7IC8vZmxvYXQuTWF4VmFsdWU7XG4gICAgICAgICAgICB2YXIgc2VnICAgPSAtMTtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IGNsb3NlZCA/IHBhdGhWZXJ0cy5sZW5ndGggOiBwYXRoVmVydHMubGVuZ3RoLTE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHQgID0gaSA9PT0gcGF0aFZlcnRzLmxlbmd0aCAtMSA/IDAgOiBpICsgMTtcbiAgICAgICAgICAgICAgICB2YXIgcHQgICAgPSB0aGlzLmdldENsb3NldFBvaW50T25MaW5lKHBhdGhWZXJ0c1tpXSwgcGF0aFZlcnRzW25leHRdLCBhUG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgICAgIHZhciB0RGlzdCA9IGNsLlBvaW50LnNxck1hZ25pdHVkZShhUG9pbnQuc3ViKHB0KSk7XG4gICAgICAgICAgICAgICAgaWYgKHREaXN0IDwgZGlzdClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3QgPSB0RGlzdDtcbiAgICAgICAgICAgICAgICAgICAgc2VnICA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjbG9zZWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHREaXN0ID0gY2wuUG9pbnQuc3FyTWFnbml0dWRlKGFQb2ludC5zdWIocGF0aFZlcnRzW3BhdGhWZXJ0cy5sZW5ndGggLSAxXSkpO1xuICAgICAgICAgICAgICAgIGlmICh0RGlzdCA8PSBkaXN0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VnID0gcGF0aFZlcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHREaXN0ID0gY2wuUG9pbnQuc3FyTWFnbml0dWRlKGFQb2ludC5zdWIocGF0aFZlcnRzWzBdKSk7XG4gICAgICAgICAgICAgICAgaWYgKHREaXN0IDw9IGRpc3QpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzZWcgPSBwYXRoVmVydHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2VnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHN0YXRpYyBmdW5jdGlvblxuICAgICAgICBnZXRTZWdtZW50czogZnVuY3Rpb24oYVBhdGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xuICAgICAgICAgICAgdmFyIGN1cnJTZWdtZW50ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFQYXRoLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGN1cnJTZWdtZW50LnB1c2goY2wucChhUGF0aFtpXSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU3BsaXQoYVBhdGgsIGkpKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChjdXJyU2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJTZWdtZW50ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGN1cnJTZWdtZW50LnB1c2goY2wucChhUGF0aFtpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goY3VyclNlZ21lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNtb290aFNlZ21lbnQ6IGZ1bmN0aW9uKGFTZWdtZW50LCBhU3BsaXREaXN0YW5jZSwgYUNsb3NlZCl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gYVNlZ21lbnQuc2xpY2UoMCk7XG4gICAgICAgICAgICB2YXIgY3VyciAgID0gMDtcbiAgICAgICAgICAgIHZhciBjb3VudCAgPSBhQ2xvc2VkID8gYVNlZ21lbnQubGVuZ3RoIDogYVNlZ21lbnQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dCAgID0gaSA9PT0gY291bnQgLSAxID8gYUNsb3NlZCA/IDAgOiBhU2VnbWVudC5sZW5ndGgtMSA6IGkrMTtcbiAgICAgICAgICAgICAgICB2YXIgc3BsaXRzID0gTWF0aC5mbG9vcihjYy5wRGlzdGFuY2UoYVNlZ21lbnRbaV0sIGFTZWdtZW50W25leHRdKSAvIGFTcGxpdERpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHNwbGl0czsgdCsrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSAodCArIDEpIC8gKHNwbGl0cyArIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc3BsaWNlKGN1cnIgKyAxLCAwLCB0aGlzLmhlcm1pdGVHZXRQdChhU2VnbWVudCwgaSwgcGVyY2VudGFnZSwgYUNsb3NlZCkpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnIgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGVybWl0ZUdldFB0OiBmdW5jdGlvbiAoYVNlZ21lbnQsIGksIGFQZXJjZW50YWdlLCBhQ2xvc2VkLCBhVGVuc2lvbiwgYUJpYXMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGFUZW5zaW9uID0gYVRlbnNpb24gPyBhVGVuc2lvbiA6IDA7XG4gICAgICAgICAgICBhQmlhcyAgICA9IGFCaWFzICAgID8gYUJpYXMgICAgOiAwO1xuXG4gICAgICAgICAgICB2YXIgYTEgPSBhQ2xvc2VkID8gaSAtIDEgPCAwID8gYVNlZ21lbnQubGVuZ3RoIC0gMiA6IGkgLSAxIDogTWF0aC5jbGFtcChpIC0gMSwgMCwgYVNlZ21lbnQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB2YXIgYTIgPSBpO1xuICAgICAgICAgICAgdmFyIGEzID0gYUNsb3NlZCA/IChpICsgMSkgJSAoYVNlZ21lbnQubGVuZ3RoKSA6IE1hdGguY2xhbXAoaSArIDEsIDAsIGFTZWdtZW50Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgdmFyIGE0ID0gYUNsb3NlZCA/IChpICsgMikgJSAoYVNlZ21lbnQubGVuZ3RoKSA6IE1hdGguY2xhbXAoaSArIDIsIDAsIGFTZWdtZW50Lmxlbmd0aCAtIDEpO1xuXG4gICAgICAgICAgICByZXR1cm4gY2wucChcbiAgICAgICAgICAgICAgICB0aGlzLmhlcm1pdGUoYVNlZ21lbnRbYTFdLngsIGFTZWdtZW50W2EyXS54LCBhU2VnbWVudFthM10ueCwgYVNlZ21lbnRbYTRdLngsIGFQZXJjZW50YWdlLCBhVGVuc2lvbiwgYUJpYXMpLFxuICAgICAgICAgICAgICAgIHRoaXMuaGVybWl0ZShhU2VnbWVudFthMV0ueSwgYVNlZ21lbnRbYTJdLnksIGFTZWdtZW50W2EzXS55LCBhU2VnbWVudFthNF0ueSwgYVBlcmNlbnRhZ2UsIGFUZW5zaW9uLCBhQmlhcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhlcm1pdGU6IGZ1bmN0aW9uKHYxLCB2MiwgdjMsIHY0LCBhUGVyY2VudGFnZSwgYVRlbnNpb24sIGFCaWFzKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbXUyID0gYVBlcmNlbnRhZ2UgKiBhUGVyY2VudGFnZTtcbiAgICAgICAgICAgIHZhciBtdTMgPSBtdTIgKiBhUGVyY2VudGFnZTtcbiAgICAgICAgICAgIHZhciBtMCA9ICh2MiAtIHYxKSAqICgxICsgYUJpYXMpICogKDEgLSBhVGVuc2lvbikgLyAyO1xuICAgICAgICAgICAgbTAgKz0gKHYzIC0gdjIpICogKDEgLSBhQmlhcykgKiAoMSAtIGFUZW5zaW9uKSAvIDI7XG4gICAgICAgICAgICB2YXIgbTEgPSAodjMgLSB2MikgKiAoMSArIGFCaWFzKSAqICgxIC0gYVRlbnNpb24pIC8gMjtcbiAgICAgICAgICAgIG0xICs9ICh2NCAtIHYzKSAqICgxIC0gYUJpYXMpICogKDEgLSBhVGVuc2lvbikgLyAyO1xuICAgICAgICAgICAgdmFyIGEwID0gMiAqIG11MyAtIDMgKiBtdTIgKyAxO1xuICAgICAgICAgICAgdmFyIGExID0gbXUzIC0gMiAqIG11MiArIGFQZXJjZW50YWdlO1xuICAgICAgICAgICAgdmFyIGEyID0gbXUzIC0gbXUyO1xuICAgICAgICAgICAgdmFyIGEzID0gLTIgKiBtdTMgKyAzICogbXUyO1xuXG4gICAgICAgICAgICByZXR1cm4gKGEwICogdjIgKyBhMSAqIG0wICsgYTIgKiBtMSArIGEzICogdjMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzU3BsaXQ6IGZ1bmN0aW9uKGFTZWdtZW50LCBpKVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSBhU2VnbWVudC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREaXJlY3Rpb24oYVNlZ21lbnRbaSAtIDFdLCBhU2VnbWVudFtpXSkgIT09IHRoaXMuZ2V0RGlyZWN0aW9uKGFTZWdtZW50W2ldLCBhU2VnbWVudFtpICsgMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldERpcmVjdGlvbjogZnVuY3Rpb24oYU9uZSwgYVR3bylcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIGRpciA9IGFPbmUuc3ViKGFUd28pO1xuICAgICAgICAgICAgZGlyID0gY2wucCgtZGlyLnksIGRpci54KTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkaXIueCkgPiBNYXRoLmFicyhkaXIueSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGRpci54IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLkxlZnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLlJpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlyLnkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbC5FbnVtLlRlcnJhaW5EaXJlY3Rpb24uQm90dG9tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsLkVudW0uVGVycmFpbkRpcmVjdGlvbi5Ub3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldERpcmVjdGlvbldpdGhTZWdtZW50OiBmdW5jdGlvbihhU2VnbWVudCwgaSwgYUludmVydCwgYUNsb3NlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBpKzE7XG4gICAgICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoYUNsb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBpICAgID0gYVNlZ21lbnQubGVuZ3RoLTI7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGk9MDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRpciA9IGFTZWdtZW50W25leHQgPiBhU2VnbWVudC5sZW5ndGgtMT8gKGFDbG9zZWQ/IGFTZWdtZW50Lmxlbmd0aC0xIDogaS0xKSA6IG5leHRdLnN1YihhU2VnbWVudFtpXSk7XG4gICAgICAgICAgICBkaXIgICAgICAgICA9IG5ldyBjYy5wKC1kaXIueSwgZGlyLngpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpci54KSA+IE1hdGguYWJzKGRpci55KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlyLnggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhSW52ZXJ0ID8gY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLlJpZ2h0IDogY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLkxlZnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYUludmVydCA/IGNsLkVudW0uVGVycmFpbkRpcmVjdGlvbi5MZWZ0ICA6IGNsLkVudW0uVGVycmFpbkRpcmVjdGlvbi5SaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKGRpci55IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYUludmVydCA/IGNsLkVudW0uVGVycmFpbkRpcmVjdGlvbi5Ub3AgICAgOiBjbC5FbnVtLlRlcnJhaW5EaXJlY3Rpb24uQm90dG9tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFJbnZlcnQgPyBjbC5FbnVtLlRlcnJhaW5EaXJlY3Rpb24uQm90dG9tIDogY2wuRW51bS5UZXJyYWluRGlyZWN0aW9uLlRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VFbmRzOiBmdW5jdGlvbihhU2VnbWVudExpc3QsIGFDb3JuZXJzKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgc3RhcnQgPSBhU2VnbWVudExpc3RbMF1bMF07XG4gICAgICAgICAgICB2YXIgc3RhcnROZXh0ID0gYVNlZ21lbnRMaXN0WzBdWzFdO1xuXG4gICAgICAgICAgICB2YXIgZW5kID0gYVNlZ21lbnRMaXN0W2FTZWdtZW50TGlzdC5sZW5ndGggLSAxXVthU2VnbWVudExpc3RbYVNlZ21lbnRMaXN0Lmxlbmd0aCAtIDFdLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgdmFyIGVuZFByZXYgPSBhU2VnbWVudExpc3RbYVNlZ21lbnRMaXN0Lmxlbmd0aCAtIDFdW2FTZWdtZW50TGlzdFthU2VnbWVudExpc3QubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gMl07XG5cbiAgICAgICAgICAgIGlmIChhQ29ybmVycyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBhU2VnbWVudExpc3RbMF0ucHVzaChzdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbmRDb3JuZXIgPSB0aGlzLmdldERpcmVjdGlvbihlbmRQcmV2LCBlbmQpICE9PSB0aGlzLmdldERpcmVjdGlvbihlbmQsIHN0YXJ0KTtcbiAgICAgICAgICAgIHZhciBzdGFydENvcm5lciA9IHRoaXMuZ2V0RGlyZWN0aW9uKGVuZCwgc3RhcnQpICE9PSB0aGlzLmdldERpcmVjdGlvbihzdGFydCwgc3RhcnROZXh0KTtcblxuICAgICAgICAgICAgaWYgKGVuZENvcm5lciAmJiBzdGFydENvcm5lcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFNlZyA9IFtdO1xuICAgICAgICAgICAgICAgIGxhc3RTZWcucHVzaChlbmQpO1xuICAgICAgICAgICAgICAgIGxhc3RTZWcucHVzaChzdGFydCk7XG5cbiAgICAgICAgICAgICAgICBhU2VnbWVudExpc3QucHVzaChsYXN0U2VnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVuZENvcm5lciAmJiAhc3RhcnRDb3JuZXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYVNlZ21lbnRMaXN0WzBdLnNwbGljZSgwLCAwLCBlbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWVuZENvcm5lciAmJiBzdGFydENvcm5lcilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhU2VnbWVudExpc3RbYVNlZ21lbnRMaXN0Lmxlbmd0aCAtIDFdLnB1c2goc3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBsYXN0ID0gYVNlZ21lbnRMaXN0W2FTZWdtZW50TGlzdC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDsgaTxsYXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFTZWdtZW50TGlzdFswXS5zcGxpY2UoaSwgMCwgbGFzdFtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFTZWdtZW50TGlzdC5zcGxpY2UoYVNlZ21lbnRMaXN0Lmxlbmd0aCAtIDEsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Tm9ybWFsOiBmdW5jdGlvbiAoYVNlZ21lbnQsIGksICBhQ2xvc2VkKSB7XG4gICAgICAgICAgICB2YXIgY3VyciA9IGFDbG9zZWQgJiYgaSA9PT0gYVNlZ21lbnQubGVuZ3RoIC0gMSA/IGFTZWdtZW50WzBdIDogYVNlZ21lbnRbaV07XG5cbiAgICAgICAgICAgIC8vIGdldCB0aGUgdmVydGV4IGJlZm9yZSB0aGUgY3VycmVudCB2ZXJ0ZXhcbiAgICAgICAgICAgIHZhciBwcmV2ID0gY2wucCgpO1xuICAgICAgICAgICAgaWYgKGktMSA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoYUNsb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2ID0gYVNlZ21lbnRbYVNlZ21lbnQubGVuZ3RoLTJdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXYgPSBjdXJyLnN1YihhU2VnbWVudFtpKzFdLnN1YihjdXJyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmV2ID0gYVNlZ21lbnRbaS0xXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ2V0IHRoZSB2ZXJ0ZXggYWZ0ZXIgdGhlIGN1cnJlbnQgdmVydGV4XG4gICAgICAgICAgICB2YXIgbmV4dCA9IGNsLnAoKTtcbiAgICAgICAgICAgIGlmIChpKzEgPiBhU2VnbWVudC5sZW5ndGgtMSkge1xuICAgICAgICAgICAgICAgIGlmIChhQ2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBhU2VnbWVudFsxXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gY3Vyci5zdWIoYVNlZ21lbnRbaS0xXS5zdWIoY3VycikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV4dCA9IGFTZWdtZW50W2krMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByZXYgPSBwcmV2LnN1YihjdXJyKTtcbiAgICAgICAgICAgIG5leHQgPSBuZXh0LnN1YihjdXJyKTtcblxuICAgICAgICAgICAgcHJldi5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIG5leHQubm9ybWFsaXplKCk7XG5cbiAgICAgICAgICAgIHByZXYgPSBuZXcgY2wucCgtcHJldi55LCBwcmV2LngpO1xuICAgICAgICAgICAgbmV4dCA9IG5ldyBjbC5wKG5leHQueSwgLW5leHQueCk7XG5cbiAgICAgICAgICAgIHZhciBub3JtID0gKHByZXYuYWRkKG5leHQpKS5kaXZpZGUoMik7XG4gICAgICAgICAgICBub3JtLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICBub3JtLnkgKj0gLTE7XG4gICAgICAgICAgICBub3JtLnggKj0gLTE7XG5cbiAgICAgICAgICAgIHJldHVybiBub3JtO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENsb3NldFBvaW50T25MaW5lOiBmdW5jdGlvbihhU3RhcnQsIGFFbmQsIGFQb2ludCwgYUNsYW1wKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgQVAgPSBhUG9pbnQuc3ViKGFTdGFydCk7XG4gICAgICAgICAgICB2YXIgQUIgPSBhRW5kLnN1YihhU3RhcnQpO1xuICAgICAgICAgICAgdmFyIGFiMiA9IEFCLngqQUIueCArIEFCLnkqQUIueTtcbiAgICAgICAgICAgIHZhciBhcF9hYiA9IEFQLngqQUIueCArIEFQLnkqQUIueTtcbiAgICAgICAgICAgIHZhciB0ID0gYXBfYWIgLyBhYjI7XG4gICAgICAgICAgICBpZiAoYUNsYW1wKSB7XG4gICAgICAgICAgICAgICAgIGlmICh0IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgdCA9IDA7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgZWxzZSBpZiAodCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgIHQgPSAxO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgQ2xvc2VzdCA9IGFTdGFydC5hZGQoQUIubXVsdCh0KSk7XG4gICAgICAgICAgICByZXR1cm4gQ2xvc2VzdDtcbiAgICAgICAgfSxcblxuICAgICAgICBfZm9sZGVyXzogIFwidGVycmFpblwiXG4gICAgfSk7XG5cbiAgICB2YXIgX3AgPSBUZXJyYWluUGF0aENvbXBvbmVudC5wcm90b3R5cGU7XG5cbiAgICBjbC5kZWZpbmVHZXR0ZXJTZXR0ZXIoX3AsIFwiY291bnRcIiwgXCJfZ2V0Q291bnRcIik7XG4gICAgY2wuZGVmaW5lR2V0dGVyU2V0dGVyKF9wLCBcInBhdGhWZXJ0c1wiLCBcIl9nZXRQYXRoVmVydHNcIiwgXCJfc2V0UGF0aFZlcnRzXCIpO1xuXG59KTtcbiIsIi8qanNsaW50IHZhcnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlLCBkZXZlbDogdHJ1ZSwgbm9tZW46IHRydWUsIHJlZ2V4cDogdHJ1ZSwgaW5kZW50OiA0LCBtYXhlcnI6IDUwICovXG4vKmdsb2JhbCBjbCovXG5cbihmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIFxuICAgIGNsLlRyaWFuZ3VsYXRvciA9IHt9O1xuXG4gICAgY2wuVHJpYW5ndWxhdG9yLmdldEluZGljZXMgPSBmdW5jdGlvbiAoYVBvaW50cywgYVRyZWF0QXNQYXRoLCBhSW52ZXJ0KSB7XG4gICAgICAgIHZhciB0cmlzICAgPSBbXTtcbiAgICAgICAgdmFyIGJvdW5kcyA9IGNsLlRyaWFuZ3VsYXRvci5nZXRCb3VuZHMoYVBvaW50cyk7XG5cbiAgICAgICAgLy8gaXQncyBlYXNpZXN0IGlmIHdlIGFkZCBpbiBzb21lIGFsbC1lbmNvbXBhc3NpbmcgdHJpcywgYW5kIHRoZW4gcmVtb3ZlIHRoZW0gbGF0ZXJcbiAgICAgICAgYVBvaW50cy5wdXNoKGNsLnAoYm91bmRzLnggLSAoYm91bmRzLnogLSBib3VuZHMueCkqMSwgYm91bmRzLncgLSAoYm91bmRzLnkgLSBib3VuZHMudykqMSkpOyAvLyA0XG4gICAgICAgIGFQb2ludHMucHVzaChjbC5wKGJvdW5kcy56ICsgKGJvdW5kcy56IC0gYm91bmRzLngpKjEsIGJvdW5kcy53IC0gKGJvdW5kcy55IC0gYm91bmRzLncpKjEpKTsgLy8gM1xuICAgICAgICBhUG9pbnRzLnB1c2goY2wucChib3VuZHMueiArIChib3VuZHMueiAtIGJvdW5kcy54KSoxLCBib3VuZHMueSArIChib3VuZHMueSAtIGJvdW5kcy53KSoxKSk7IC8vIDJcbiAgICAgICAgYVBvaW50cy5wdXNoKGNsLnAoYm91bmRzLnggLSAoYm91bmRzLnogLSBib3VuZHMueCkqMSwgYm91bmRzLnkgKyAoYm91bmRzLnkgLSBib3VuZHMudykqMSkpOyAvLyAxXG4gICAgICAgIHRyaXMucHVzaChhUG9pbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB0cmlzLnB1c2goYVBvaW50cy5sZW5ndGggLSAyKTtcbiAgICAgICAgdHJpcy5wdXNoKGFQb2ludHMubGVuZ3RoIC0gMyk7XG4gICAgICAgIHRyaXMucHVzaChhUG9pbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB0cmlzLnB1c2goYVBvaW50cy5sZW5ndGggLSAzKTtcbiAgICAgICAgdHJpcy5wdXNoKGFQb2ludHMubGVuZ3RoIC0gNCk7XG5cbiAgICAgICAgLy8gYWRkIGluIGFsbCB0aGUgdmVycyBvZiB0aGUgcGF0aFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFQb2ludHMubGVuZ3RoIC0gNDsgaSArPSAxKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdHJpID0gY2wuVHJpYW5ndWxhdG9yLmdldFN1cnJvdW5kaW5nVHJpKGFQb2ludHMsIHRyaXMsIGFQb2ludHNbaV0pO1xuXG4gICAgICAgICAgICBpZiAodHJpICE9PSAtMSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgdDEgPSB0cmlzW3RyaV07XG4gICAgICAgICAgICAgICAgdmFyIHQyID0gdHJpc1t0cmkgKyAxXTtcbiAgICAgICAgICAgICAgICB2YXIgdDMgPSB0cmlzW3RyaSArIDJdO1xuXG4gICAgICAgICAgICAgICAgdHJpc1t0cmldID0gdDE7XG4gICAgICAgICAgICAgICAgdHJpc1t0cmkrMV0gPSB0MjtcbiAgICAgICAgICAgICAgICB0cmlzW3RyaSsyXSA9IGk7XG5cbiAgICAgICAgICAgICAgICB0cmlzLnB1c2godDIpO1xuICAgICAgICAgICAgICAgIHRyaXMucHVzaCh0Myk7XG4gICAgICAgICAgICAgICAgdHJpcy5wdXNoKGkpO1xuXG4gICAgICAgICAgICAgICAgdHJpcy5wdXNoKHQzKTtcbiAgICAgICAgICAgICAgICB0cmlzLnB1c2godDEpO1xuICAgICAgICAgICAgICAgIHRyaXMucHVzaChpKTtcblxuICAgICAgICAgICAgICAgIGNsLlRyaWFuZ3VsYXRvci5lZGdlRmxpcChhUG9pbnRzLCB0cmlzLCB0cmkpO1xuICAgICAgICAgICAgICAgIGNsLlRyaWFuZ3VsYXRvci5lZGdlRmxpcChhUG9pbnRzLCB0cmlzLCB0cmlzLmxlbmd0aC0zKTtcbiAgICAgICAgICAgICAgICBjbC5Ucmlhbmd1bGF0b3IuZWRnZUZsaXAoYVBvaW50cywgdHJpcywgdHJpcy5sZW5ndGgtNik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoYWNreSBzb2x1dGlvbiB0byB0aGUgc3RhY2sgb3ZlcmZsb3cgb24gdGhlIHJlY3Vyc2l2ZSBlZGdlIGZsaXBwaW5nIEkgd2FzIGdldHRpbmdcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmlzLmxlbmd0aCoyOyBpKz0zKSB7XG4gICAgICAgICAgICBjbC5Ucmlhbmd1bGF0b3IuZWRnZUZsaXAoYVBvaW50cyx0cmlzLCBpJXRyaXMubGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZW5jb21wYXNzaW5nIHRyaWFuZ2xlc1xuICAgICAgICBpZiAoIWFJbnZlcnQpIHtcbiAgICAgICAgICAgIGFQb2ludHMuc3BsaWNlKGFQb2ludHMubGVuZ3RoIC0gNCwgNCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB2YXIgaW52ZXJ0TWVzaCA9IGFJbnZlcnQgPyAwIDogMTtcbiAgICAgICAgZm9yICh2YXIgaT0wO2k8dHJpcy5sZW5ndGg7aSs9Mykge1xuICAgICAgICAgICAgaWYgKGFJbnZlcnQgfHwgXG4gICAgICAgICAgICAgICAodHJpc1tpICBdIDwgYVBvaW50cy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICB0cmlzW2krMV0gPCBhUG9pbnRzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIHRyaXNbaSsyXSA8IGFQb2ludHMubGVuZ3RoKSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGNlbnRlciA9IGFQb2ludHNbdHJpc1tpXV0uYWRkKCBhUG9pbnRzW3RyaXNbaSsxXV0gKS5hZGQoIGFQb2ludHNbdHJpc1tpKzJdXSApLmRpdmlkZSgzKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFUcmVhdEFzUGF0aCB8fCAoY2wuVHJpYW5ndWxhdG9yLmdldFNlZ21lbnRzVW5kZXIoYVBvaW50cywgY2VudGVyLngsIGNlbnRlci55LCBhSW52ZXJ0KS5sZW5ndGgvMikgJSAyID09PSBpbnZlcnRNZXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbC5Ucmlhbmd1bGF0b3IuaXNDbG9ja3dpc2UoYVBvaW50c1t0cmlzW2ldXSwgYVBvaW50c1t0cmlzW2krMV1dLCBhUG9pbnRzW3RyaXNbaSsyXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0cmlzW2krMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godHJpc1tpKzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRyaXNbaSAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0cmlzW2kgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godHJpc1tpKzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRyaXNbaSsyXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBjbC5Ucmlhbmd1bGF0b3IuZ2V0U2VnbWVudHNVbmRlciA9IGZ1bmN0aW9uIChhUGF0aCwgYVgsIGFZLCBhSWdub3JlTGFzdCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBvZmYgPSBhSWdub3JlTGFzdCA/IDQgOiAwO1xuICAgICAgICBmb3IgKHZhciBpPTA7aTxhUGF0aC5sZW5ndGgtb2ZmO2krPTEpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gaSsxID49IGFQYXRoLmxlbmd0aC1vZmYgPyAwIDogaSsxO1xuICAgICAgICAgICAgdmFyIG1pbiA9IGFQYXRoW2ldLnggPCBhUGF0aFtuZXh0XS54ID8gaSA6IG5leHQ7XG4gICAgICAgICAgICB2YXIgbWF4ID0gYVBhdGhbaV0ueCA+IGFQYXRoW25leHRdLnggPyBpIDogbmV4dDtcblxuICAgICAgICAgICAgaWYgKGFQYXRoW21pbl0ueCA8PSBhWCAmJiBhUGF0aFttYXhdLnggPiBhWCkge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBNYXRoLmxlcnAoYVBhdGhbbWluXS55LCBhUGF0aFttYXhdLnksIChhWCAtIGFQYXRoW21pbl0ueCkgLyAoYVBhdGhbbWF4XS54IC0gYVBhdGhbbWluXS54KSk7XG4gICAgICAgICAgICAgICAgaWYgKGFZID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1pbik7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1heCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIFxuICAgIC8vLyA8c3VtbWFyeT5cbiAgICAvLy8gR2V0cyBhIGJvdW5kaW5nIHJlY3RhbmdsZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gcG9pbnRzXG4gICAgLy8vIDwvc3VtbWFyeT5cbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJhUG9pbnRzXCI+TGlzdCBvZiBwb2ludHMuPC9wYXJhbT5cbiAgICAvLy8gPHJldHVybnM+eCA9IGxlZnQsIHkgPSB0b3AsIHogPSByaWdodCwgdyA9IGJvdHRvbTwvcmV0dXJucz5cbiAgICBjbC5Ucmlhbmd1bGF0b3IuZ2V0Qm91bmRzID0gZnVuY3Rpb24gKGFQb2ludHMpIHtcbiAgICAgICAgaWYgKGFQb2ludHMubGVuZ3RoIDw9MCkge1xuICAgICAgICAgICAgcmV0dXJuIHt4OjAsIHk6MCwgejoxLCB3OjF9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbGVmdCAgID0gYVBvaW50c1swXS54O1xuICAgICAgICB2YXIgcmlnaHQgID0gYVBvaW50c1swXS54O1xuICAgICAgICB2YXIgdG9wICAgID0gYVBvaW50c1swXS55O1xuICAgICAgICB2YXIgYm90dG9tID0gYVBvaW50c1swXS55O1xuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxhUG9pbnRzLmxlbmd0aDsgaSs9MSkge1xuICAgICAgICAgICAgaWYgKGFQb2ludHNbaV0ueCA8IGxlZnQgICkgeyBsZWZ0ICAgPSBhUG9pbnRzW2ldLng7IH1cbiAgICAgICAgICAgIGlmIChhUG9pbnRzW2ldLnggPiByaWdodCApIHsgcmlnaHQgID0gYVBvaW50c1tpXS54OyB9XG4gICAgICAgICAgICBpZiAoYVBvaW50c1tpXS55ID4gdG9wICAgKSB7IHRvcCAgICA9IGFQb2ludHNbaV0ueTsgfVxuICAgICAgICAgICAgaWYgKGFQb2ludHNbaV0ueSA8IGJvdHRvbSkgeyBib3R0b20gPSBhUG9pbnRzW2ldLnk7IH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge3g6bGVmdCwgeTp0b3AsIHo6cmlnaHQsIHc6Ym90dG9tfTtcbiAgICB9O1xuICAgIFxuICAgIC8vLyA8c3VtbWFyeT5cbiAgICAvLy8gSXMgdGhlIGdpdmVuIHBvaW50IGluc2lkZSBhIDJEIHRyaWFuZ2xlP1xuICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwiYVRyaTFcIj5UcmlhbmdsZSBwb2ludCAxPC9wYXJhbT5cbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJhVHJpMlwiPlRyaWFuZ2xlIHBvaW50IDI8L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cImFUcmkzXCI+VHJpYW5nbGUgcG9pbnQgOTAwMTwvcGFyYW0+XG4gICAgLy8vIDxwYXJhbSBuYW1lPVwiYVB0XCI+VGhlIHBvaW50IHRvIHRlc3QhPC9wYXJhbT5cbiAgICAvLy8gPHJldHVybnM+SVMgSVQgSU5TSURFIFlFVD88L3JldHVybnM+XG4gICAgY2wuVHJpYW5ndWxhdG9yLnB0SW5UcmkgPSBmdW5jdGlvbiAoYVRyaTEsICBhVHJpMiwgYVRyaTMsIGFQdCkge1xuICAgICAgICB2YXIgYXNfeCA9IGFQdC54IC0gYVRyaTEueDtcbiAgICAgICAgdmFyIGFzX3kgPSBhUHQueSAtIGFUcmkxLnk7XG4gICAgICAgIHZhciAgc19hYiA9IChhVHJpMi54IC0gYVRyaTEueCkgKiBhc195IC0gKGFUcmkyLnkgLSBhVHJpMS55KSAqIGFzX3ggPiAwO1xuXG4gICAgICAgIGlmICgoYVRyaTMueCAtIGFUcmkxLngpICogYXNfeSAtIChhVHJpMy55IC0gYVRyaTEueSkgKiBhc194ID4gMCA9PT0gc19hYikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgaWYgKChhVHJpMy54IC0gYVRyaTIueCkgKiAoYVB0LnkgLSBhVHJpMi55KSAtIChhVHJpMy55IC0gYVRyaTIueSkgKiAoYVB0LnggLSBhVHJpMi54KSA+IDAgIT09IHNfYWIpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvLy8gPHN1bW1hcnk+XG4gICAgLy8vIEdldHMgdGhlIHBvaW50IHdoZXJlIHR3byBsaW5lcyBpbnRlcnNlY3QsIHJlYWxseSB1c2VmdWwgZm9yIGRldGVybWluaW5nIHRoZSBjaXJjdW1jZW50ZXIuXG4gICAgLy8vIDwvc3VtbWFyeT5cbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJhU3RhcnQxXCI+TGluZSAxIHN0YXJ0PC9wYXJhbT5cbiAgICAvLy8gPHBhcmFtIG5hbWU9XCJhRW5kMVwiPkxpbmUgMSBsbGFtbWE8L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cImFTdGFydDJcIj5MaW5lIDIgc3RhcnQ8L3BhcmFtPlxuICAgIC8vLyA8cGFyYW0gbmFtZT1cImFFbmQyXCI+TGluZSAyIGVuZDwvcGFyYW0+XG4gICAgLy8vIDxyZXR1cm5zPldIRVJFIFRIRVkgSU5URVJTRUNUPC9yZXR1cm5zPlxuICAgIGNsLlRyaWFuZ3VsYXRvci5saW5lSW50ZXJzZWN0aW9uUG9pbnQgPSBmdW5jdGlvbiAoYVN0YXJ0MSwgYUVuZDEsIGFTdGFydDIsIGFFbmQyKVxuICAgIHtcbiAgICAgICAgdmFyIEExID0gYUVuZDEgIC55IC0gYVN0YXJ0MS55O1xuICAgICAgICB2YXIgQjEgPSBhU3RhcnQxLnggLSBhRW5kMSAgLng7XG4gICAgICAgIHZhciBDMSA9IEExICogYVN0YXJ0MS54ICsgQjEgKiBhU3RhcnQxLnk7XG5cbiAgICAgICAgdmFyIEEyID0gYUVuZDIgIC55IC0gYVN0YXJ0Mi55O1xuICAgICAgICB2YXIgQjIgPSBhU3RhcnQyLnggLSBhRW5kMiAgLng7XG4gICAgICAgIHZhciBDMiA9IEEyICogYVN0YXJ0Mi54ICsgQjIgKiBhU3RhcnQyLnk7XG5cbiAgICAgICAgdmFyIGRlbHRhID0gQTEqQjIgLSBBMipCMTtcblxuICAgICAgICByZXR1cm4gY2wucCggKEIyKkMxIC0gQjEqQzIpL2RlbHRhLCAoQTEqQzIgLSBBMipDMSkvZGVsdGEpO1xuICAgIH07XG4gICAgLy8vIDxzdW1tYXJ5PlxuICAgIC8vLyBEZXRlcm1pbmVzIGlmIHRoZXNlIHBvaW50cyBhcmUgaW4gY2xvY2t3aXNlIG9yZGVyLlxuICAgIC8vLyA8L3N1bW1hcnk+XG4gICAgY2wuVHJpYW5ndWxhdG9yLmlzQ2xvY2t3aXNlID0gZnVuY3Rpb24gKGFQdDEsIGFQdDIsIGFQdDMpIHtcbiAgICAgICAgcmV0dXJuIChhUHQyLnggLSBhUHQxLngpKihhUHQzLnkgLSBhUHQxLnkpIC0gKGFQdDMueCAtIGFQdDEueCkqKGFQdDIueSAtIGFQdDEueSkgPiAwO1xuICAgIH07XG5cblxuXG4gICAgLy8gcHJpdmF0ZSBmdW5jdGlvblxuXG4gICAgY2wuVHJpYW5ndWxhdG9yLmdldENpcmN1bWNlbnRlciA9IGZ1bmN0aW9uIChhUG9pbnRzLCBhVHJpcywgYVRyaSkge1xuICAgICAgICAvLyBmaW5kIG1pZHBvaW50cyBvbiB0d28gc2lkZXNcbiAgICAgICAgdmFyIG1pZEEgPSBhUG9pbnRzW2FUcmlzW2FUcmkgIF1dLmFkZChhUG9pbnRzW2FUcmlzW2FUcmkrMV1dKS5kaXZpZGUoMik7XG4gICAgICAgIHZhciBtaWRCID0gYVBvaW50c1thVHJpc1thVHJpKzFdXS5hZGQoYVBvaW50c1thVHJpc1thVHJpKzJdXSkuZGl2aWRlKDIpO1xuICAgICAgICAvLyBnZXQgYSBwZXJwZW5kaWN1bGFyIGxpbmUgZm9yIGVhY2ggbWlkcG9pbnRcbiAgICAgICAgdmFyIGRpckEgPSBhUG9pbnRzW2FUcmlzW2FUcmkgIF1dLnN1YihhUG9pbnRzW2FUcmlzW2FUcmkrMV1dKTsgZGlyQSA9IGNsLnAoZGlyQS55LCAtZGlyQS54KTtcbiAgICAgICAgdmFyIGRpckIgPSBhUG9pbnRzW2FUcmlzW2FUcmkrMV1dLnN1YihhUG9pbnRzW2FUcmlzW2FUcmkrMl1dKTsgZGlyQiA9IGNsLnAoZGlyQi55LCAtZGlyQi54KTtcbiAgICAgICAgLy8gdGhlIGludGVyc2VjdGlvbiBzaG91bGQgZ2l2ZSB1cyB0aGUgY2lyY3VtY2VudGVyXG4gICAgICAgIHJldHVybiBjbC5Ucmlhbmd1bGF0b3IubGluZUludGVyc2VjdGlvblBvaW50KG1pZEEsIG1pZEEuYWRkKGRpckEpLCBtaWRCLCBtaWRCLmFkZChkaXJCKSk7XG4gICAgfTtcblxuICAgIGNsLlRyaWFuZ3VsYXRvci5lZGdlRmxpcCA9IGZ1bmN0aW9uIChhUG9pbnRzLCBhVHJpcywgYVRyaSkge1xuICAgICAgICB2YXIgeHl6ICAgICAgPSBbXTtcbiAgICAgICAgdmFyIGFiYyAgICAgID0gW107XG4gICAgICAgIHZhciBzaGFyZWQgICA9IFtdO1xuICAgICAgICB2YXIgb3Bwb3NpbmcgPSBbXTtcblxuICAgICAgICB4eXoucHVzaCAoIGFUcmlzW2FUcmldICAgKTtcbiAgICAgICAgeHl6LnB1c2ggKCBhVHJpc1thVHJpKzFdICk7XG4gICAgICAgIHh5ei5wdXNoICggYVRyaXNbYVRyaSsyXSApO1xuICAgICAgICB2YXIgY2VudGVyID0gY2wuVHJpYW5ndWxhdG9yLmdldENpcmN1bWNlbnRlcihhUG9pbnRzLCBhVHJpcywgYVRyaSk7XG4gICAgICAgIHZhciBkaXN0U3EgPSBjbC5Qb2ludC5zcXJNYWduaXR1ZGUoYVBvaW50c1t4eXpbMF1dLnN1YihjZW50ZXIpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFUcmlzLmxlbmd0aDsgaSs9Mykge1xuICAgICAgICAgICAgaWYgKGkgPT09IGFUcmkpIHsgY29udGludWU7IH1cblxuICAgICAgICAgICAgc2hhcmVkICAgPSBbXTtcbiAgICAgICAgICAgIG9wcG9zaW5nID0gW107XG4gICAgICAgICAgICBhYmMgICAgICA9IFtdO1xuICAgICAgICAgICAgYWJjLnB1c2ggKGFUcmlzW2ldKTtcbiAgICAgICAgICAgIGFiYy5wdXNoIChhVHJpc1tpKzFdKTtcbiAgICAgICAgICAgIGFiYy5wdXNoIChhVHJpc1tpKzJdKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdHJpSUQxID0gMDsgdHJpSUQxIDwgMzsgdHJpSUQxKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHRyaUlEMiA9IDA7IHRyaUlEMiA8IDM7IHRyaUlEMisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4eXpbdHJpSUQxXSA9PT0gYWJjW3RyaUlEMl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlZC5wdXNoKHh5elt0cmlJRDFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wcG9zaW5nLnB1c2ggKHh5elt0cmlJRDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3Bwb3NpbmcubGVuZ3RoID09PSAxICYmIHNoYXJlZC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0cmlJRDEgPSAwOyB0cmlJRDEgPCAzOyB0cmlJRDErKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWJjW3RyaUlEMV0gIT09IHNoYXJlZFswXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJjW3RyaUlEMV0gIT09IHNoYXJlZFsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJjW3RyaUlEMV0gIT09IG9wcG9zaW5nWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHBvc2luZy5wdXNoIChhYmNbdHJpSUQxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9wcG9zaW5nLmxlbmd0aCA9PT0gMiAmJiBzaGFyZWQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNxciA9IGNsLlBvaW50LnNxck1hZ25pdHVkZShhUG9pbnRzW29wcG9zaW5nWzFdXS5zdWIoY2VudGVyKSk7XG4gICAgICAgICAgICAgICAgLy8gY2MubG9nKFwic3FyIDogJWYgICAlZlwiLCBzcXIsIGRpc3RTcSk7XG4gICAgICAgICAgICAgICAgaWYoc3FyIDwgZGlzdFNxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYVRyaXNbYVRyaSAgXSA9IG9wcG9zaW5nWzBdO1xuICAgICAgICAgICAgICAgICAgICBhVHJpc1thVHJpKzFdID0gc2hhcmVkICBbMF07XG4gICAgICAgICAgICAgICAgICAgIGFUcmlzW2FUcmkrMl0gPSBvcHBvc2luZ1sxXTtcblxuICAgICAgICAgICAgICAgICAgICBhVHJpc1tpICBdID0gb3Bwb3NpbmdbMV07XG4gICAgICAgICAgICAgICAgICAgIGFUcmlzW2krMV0gPSBzaGFyZWQgIFsxXTtcbiAgICAgICAgICAgICAgICAgICAgYVRyaXNbaSsyXSA9IG9wcG9zaW5nWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vRWRnZUZsaXAoYVBvaW50cywgYVRyaXMsIGFUcmkpO1xuICAgICAgICAgICAgICAgICAgICAvL0VkZ2VGbGlwKGFQb2ludHMsIGFUcmlzLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgY2wuVHJpYW5ndWxhdG9yLmdldFN1cnJvdW5kaW5nVHJpID0gZnVuY3Rpb24gKGFQb2ludHMsIGFUcmlzLCBhUHQpIHtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFUcmlzLmxlbmd0aDsgaSs9Mykge1xuICAgICAgICAgICAgaWYgKGNsLlRyaWFuZ3VsYXRvci5wdEluVHJpKGFQb2ludHNbYVRyaXNbaV1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgYVBvaW50c1thVHJpc1tpKzFdXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFQb2ludHNbYVRyaXNbaSsyXV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhUHQgKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG5cbn0pKCk7Il19
