module.exports = function(grunt) {

    var through = require('through2');
    var path = require('path');

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-browserify');

    var dir = path.join(process.cwd(), "frameworks/cocos2d-html5/cocoslite/");

    var webFiles = {dest:'bundle.js', src:['./frameworks/cocos2d-html5/cocoslite/**/*.js','./src/**/*.js', '!./src/**/Editor/**']};
    var jsbFiles = {dest:'bundle.js', src:['./frameworks/cocos2d-html5/cocoslite/**/*.js', '!./frameworks/cocos2d-html5/cocoslite/object/**/*.js', './src/**/*.js', '!./src/**/Editor/**']};

    var transform = function (file) {
        var data = '';

        function write (buf, enc, next) { data += buf;  next(); }
        function end (next) {
            var rd = path.relative(path.dirname(file), dir);

            data = data.replace(/(cl.getModule)\(["'](.*)(\.js)*["']\)/g, function($0, $1, $2){
                var file = path.join(rd, $2);
                return 'require("'+file+'.js")';
            });

            this.push(data);
            next(); 
        }

        return through(write, end);
    }

    var options = {

        watch: true,
        keepAlive: true,

        browserifyOptions: {
            transform: transform
        }

    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: options,

            web: {
                files: [webFiles]
            },
            jsb: {
                files: [jsbFiles]
            },

            debug_web: {
                files: [webFiles],
                options: {
                    browserifyOptions: {
                        debug: true,
                        transform: transform
                    }
                }
            },
            debug_jsb: {
                files: [jsbFiles],
                options: {
                    browserifyOptions: {
                        debug: true,
                        transform: transform
                    }
                }
            },
        }
    });
  
    // 默认被执行的任务列表。
    grunt.registerTask('default',   ['browserify:web']);
    grunt.registerTask('jsb',       ['browserify:jsb']);
    grunt.registerTask('debug_web', ['browserify:debug_web']);
    grunt.registerTask('debug_jsb', ['browserify:debug_jsb']);
};