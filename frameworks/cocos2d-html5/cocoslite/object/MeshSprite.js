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
