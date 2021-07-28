define(["require", "exports", "./material"], function (require, exports, material_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WebGLManager = /** @class */ (function () {
        function WebGLManager(context) {
            this.textures = {};
            this.materials = {};
            this.geometries = {};
            this.renderQueue = {};
            this.gl = context;
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
        WebGLManager.prototype.getTexture = function (name) {
            if (this.textures[name] == undefined) {
                throw new Error("Texture " + name + " not found");
            }
            return this.textures[name];
        };
        WebGLManager.prototype.createTexture = function (name, image) {
            if (this.textures[name] != undefined) {
                throw new Error("texture " + name + " already defined");
            }
            var glTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            // TODO: Need to check if webgl does support mipmapping with npot textures
            // https://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
            // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
            //this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.textures[name] = new material_1.Texture(glTexture, [image.width, image.height]);
        };
        WebGLManager.prototype.setScene = function (scene) {
            this.scene = scene;
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
            for (var matName in this.renderQueue) {
                var material = this.materials[matName];
                var geomQueue = this.renderQueue[matName];
                for (var _i = 0, geomQueue_1 = geomQueue; _i < geomQueue_1.length; _i++) {
                    var geometry = geomQueue_1[_i];
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometry.vertexBuffer);
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);
                    material.use({
                        gl: this.gl,
                        modelViewMatrix: geometry.matrix,
                        projectionMatrix: projectionViewMatrix
                    });
                    this.gl.drawElements(this.gl.TRIANGLES, 3 * geometry.faceCount, this.gl.UNSIGNED_SHORT, 0);
                }
            }
        };
        return WebGLManager;
    }());
    exports.WebGLManager = WebGLManager;
});
//# sourceMappingURL=webglmanager.js.map