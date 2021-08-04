var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "gl-matrix", "./texture"], function (require, exports, gl_matrix_1, texture_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebGLManager = void 0;
    var WebGLManager = /** @class */ (function () {
        function WebGLManager(context) {
            this.materials = {};
            this.geometries = {};
            this.renderQueue = {};
            this.gl = context;
            texture_1.TextureManager.init(context);
        }
        WebGLManager.prototype.addMaterial = function (name, material) {
            if (this.materials[name] !== undefined) {
                throw new Error("Material " + name + " already added");
            }
            this.materials[name] = material;
            this.renderQueue[name] = [];
        };
        WebGLManager.prototype.addGeometry = function (name, geometry, pname) {
            if (this.geometries[name] !== undefined) {
                throw new Error("Geometry " + name + " already added");
            }
            if (this.materials[pname] == undefined) {
                throw new Error("Program " + pname + " not defined");
            }
            this.geometries[name] = geometry;
            this.renderQueue[pname].push(geometry);
            geometry.build(this.gl);
        };
        WebGLManager.prototype.setCamera = function (camera) {
            this.camera = camera;
        };
        WebGLManager.prototype.setScene = function (scene) {
            this.scene = scene;
        };
        WebGLManager.prototype.sortGeometriesByCamPos = function (geometries, reverse) {
            if (reverse === void 0) { reverse = false; }
            var camPos = this.camera.getPosition();
            var sortedGeometries = new (Array.bind.apply(Array, __spreadArrays([void 0], geometries)))();
            sortedGeometries.sort(function (a, b) {
                var aDist = gl_matrix_1.vec3.dist(camPos, a.getPosition());
                var bDist = gl_matrix_1.vec3.dist(camPos, b.getPosition());
                return reverse ? (bDist - aDist) : (aDist - bDist);
            });
            return sortedGeometries;
        };
        WebGLManager.prototype.render = function () {
            // Compute camera matrix only once
            var projectionViewMatrix = this.camera.getViewProjectionMatrix();
            // Context initialization
            this.gl.clearColor(0, 0, 0, 1);
            this.gl.clearDepth(1);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.enable(this.gl.BLEND);
            for (var matName in this.renderQueue) {
                var material = this.materials[matName];
                var geomQueue = this.sortGeometriesByCamPos(this.renderQueue[matName], true);
                material.render(this.gl, projectionViewMatrix, geomQueue);
            }
        };
        return WebGLManager;
    }());
    exports.WebGLManager = WebGLManager;
});
//# sourceMappingURL=webglmanager.js.map