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

    var Component = cl.getModule("component/Component");

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
