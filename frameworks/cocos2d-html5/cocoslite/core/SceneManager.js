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
