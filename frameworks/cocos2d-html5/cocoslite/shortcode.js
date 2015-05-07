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
