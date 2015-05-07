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