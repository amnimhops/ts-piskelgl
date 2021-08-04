var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./texture"], function (require, exports, texture_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnimatedTextureMaterial = exports.TextureMaterial = exports.ColorMaterial = exports.Material = exports.Texture = void 0;
    Object.defineProperty(exports, "Texture", { enumerable: true, get: function () { return texture_1.Texture; } });
    function loadShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            throw new Error('Error compiling shader:' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    function initShaders(gl, vsSource, fsSource) {
        var vs = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        var fs = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Error initializing shaders:' + gl.getProgramInfoLog(program));
        }
        return program;
    }
    var Material = /** @class */ (function () {
        function Material(vsSource, fsSource) {
            this.vsSource = vsSource;
            this.fsSource = fsSource;
            this.compiled = false;
        }
        Material.prototype.getProgram = function () {
            return this.glProgram;
        };
        Material.prototype.compile = function (gl) {
            this.glProgram = initShaders(gl, this.vsSource, this.fsSource);
            // Avoid compile again
            this.compiled = true;
        };
        Material.prototype.beforeDraw = function (gl) {
        };
        /**
         *
         * @param gl
         * @param projectionMatrix
         * @param modelViewMatrix
         * @param samplerTextureId 0 for GL_TEXTURE0 and so on
         */
        Material.prototype.render = function (gl, projectionMatrix, geometries) {
            if (!this.compiled) {
                this.compile(gl);
            }
            // Note to myself: useProgram must be invoked before uniform setup
            gl.useProgram(this.glProgram);
            var camUniform = gl.getUniformLocation(this.glProgram, "uProjectionMatrix");
            var modelViewUniform = gl.getUniformLocation(this.glProgram, "uModelViewMatrix");
            for (var _i = 0, geometries_1 = geometries; _i < geometries_1.length; _i++) {
                var geometry = geometries_1[_i];
                gl.uniformMatrix4fv(camUniform, false, projectionMatrix);
                this.beforeDraw(gl);
                // Vertex data is located in the first 3 floats of the vertex buffer
                var vertexAttrib = gl.getAttribLocation(this.glProgram, "aVertexPosition");
                gl.vertexAttribPointer(vertexAttrib, 3, gl.FLOAT, false, Material.VERTEX_SIZE, 0); // first 3 floats
                gl.enableVertexAttribArray(vertexAttrib);
                gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);
                gl.uniformMatrix4fv(modelViewUniform, false, geometry.matrix);
                gl.drawElements(gl.TRIANGLES, 3 * geometry.faceCount, gl.UNSIGNED_SHORT, 0);
            }
        };
        Material.VERTEX_ATTRIBUTES = 3 + 2; // x y z u v
        Material.VERTEX_ATTRIBUTE_SIZE = Float32Array.BYTES_PER_ELEMENT;
        Material.VERTEX_SIZE = Material.VERTEX_ATTRIBUTE_SIZE * Material.VERTEX_ATTRIBUTES;
        return Material;
    }());
    exports.Material = Material;
    var ColorMaterial = /** @class */ (function (_super) {
        __extends(ColorMaterial, _super);
        function ColorMaterial(color) {
            var _this = _super.call(this, ColorMaterial.VS_SRC, ColorMaterial.FS_SSRC) || this;
            _this.color = color;
            return _this;
        }
        ColorMaterial.prototype.beforeDraw = function (gl) {
            // Add uniform for material rgb color
            var matColorUniform = gl.getUniformLocation(this.getProgram(), "matColor");
            gl.uniform4fv(matColorUniform, this.color);
        };
        ColorMaterial.VS_SRC = "\n        attribute vec4 aVertexPosition;\n                \n        uniform mat4 uModelViewMatrix;\n        uniform mat4 uProjectionMatrix;\n        \n        void main() {\n            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n        }\n        ";
        ColorMaterial.FS_SSRC = "\n        uniform highp vec4 matColor;\n\n        void main() {\n            gl_FragColor = matColor;\n\n        }\n    ";
        return ColorMaterial;
    }(Material));
    exports.ColorMaterial = ColorMaterial;
    var TextureMaterial = /** @class */ (function (_super) {
        __extends(TextureMaterial, _super);
        function TextureMaterial(texture) {
            var _this = _super.call(this, TextureMaterial.VS_SRC, TextureMaterial.FS_SSRC) || this;
            _this.texture = texture;
            return _this;
        }
        TextureMaterial.prototype.beforeDraw = function (gl) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture.glTex);
            var textCoordAttrib = gl.getAttribLocation(this.getProgram(), "aTextureCoord");
            gl.vertexAttribPointer(textCoordAttrib, 2, gl.FLOAT, false, Material.VERTEX_SIZE, 3 * Material.VERTEX_ATTRIBUTE_SIZE); // skip 3 floats, next 2 floats
            gl.enableVertexAttribArray(textCoordAttrib);
            var samplerUniform = gl.getUniformLocation(this.getProgram(), "uSampler");
            gl.uniform1i(samplerUniform, 0); // Texture #0, the single texture
        };
        TextureMaterial.VS_SRC = "\n        attribute vec4 aVertexPosition;\n                \n        uniform mat4 uModelViewMatrix;\n        uniform mat4 uProjectionMatrix;\n\n        attribute vec2 aTextureCoord;\n        varying highp vec2 vTextureCoord;\n\n        void main() {\n            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n            vTextureCoord = aTextureCoord;\n        }\n        ";
        TextureMaterial.FS_SSRC = "\n        varying highp vec2 vTextureCoord;\n        uniform sampler2D uSampler;\n        void main() {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n        }\n    ";
        return TextureMaterial;
    }(Material));
    exports.TextureMaterial = TextureMaterial;
    var AnimatedTextureMaterial = /** @class */ (function (_super) {
        __extends(AnimatedTextureMaterial, _super);
        function AnimatedTextureMaterial(texture, frameSize, numFrames) {
            var _this = _super.call(this, AnimatedTextureMaterial.VS_SRC, AnimatedTextureMaterial.FS_SSRC) || this;
            _this.texture = texture;
            _this.frameSize = frameSize;
            _this.numFrames = numFrames;
            _this.frameIndex = 0;
            return _this;
        }
        AnimatedTextureMaterial.prototype.beforeDraw = function (gl) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture.glTex);
            /*
             * setup texture coords attribute
             */
            var textCoordAttrib = gl.getAttribLocation(this.getProgram(), "aTextureCoord");
            gl.vertexAttribPointer(textCoordAttrib, 2, gl.FLOAT, false, Material.VERTEX_SIZE, 3 * Material.VERTEX_ATTRIBUTE_SIZE); // skip 3 floats, next 2 floats
            gl.enableVertexAttribArray(textCoordAttrib);
            /*
             * setup frame index attribute and atlas/frame uniforms
             */
            var frameIndexAttrib = gl.getAttribLocation(this.getProgram(), "aFrameIndex");
            // Notice we are using here GL.FLOAT even though frame index seems to be an integer (in fact, it is).
            // This is because the entire buffer is a float32array.
            gl.vertexAttribPointer(frameIndexAttrib, 1, gl.FLOAT, false, Material.VERTEX_SIZE, 5 * Material.VERTEX_ATTRIBUTE_SIZE); // Skip 5 floats, next 1 float
            gl.enableVertexAttribArray(frameIndexAttrib);
            var atlasSizeUniform = gl.getUniformLocation(this.getProgram(), "uAtlasSize");
            var frameSizeUniform = gl.getUniformLocation(this.getProgram(), "uFrameSize");
            var textureFrameIndexOffset = gl.getUniformLocation(this.getProgram(), "uFrameIndexOffset");
            gl.uniform2fv(atlasSizeUniform, this.texture.size);
            gl.uniform2fv(frameSizeUniform, this.frameSize);
            gl.uniform1f(textureFrameIndexOffset, this.frameIndex);
            //const atlasWidth = gl.getTexParameter(gl.TEXTURE_2D,gl.WIODTH)
            //gl.uniform2fv(atlasSizeUniform)
            /*
             * Setup sampler uniform
             */
            var samplerUniform = gl.getUniformLocation(this.getProgram(), "uSampler");
            gl.uniform1i(samplerUniform, 0); // Texture #0, the single texture
            // Increase frame counter
            //this.frameIndex = (this.frameIndex+1) % this.numFrames
            //if(this.frameIndex%1000 == 0) console.log(this.frameIndex)
        };
        AnimatedTextureMaterial.VS_SRC = "\n        attribute vec4 aVertexPosition;\n        \n        // TIP: If an attribute is not used, glAttribGetLocation returns -1 and a warning is shown on console\n\n        attribute float aFrameIndex; // Vertex frame index\n        uniform vec2 uAtlasSize; // Atlas width and height\n        uniform vec2 uFrameSize; // Frame width and height\n        uniform float uFrameIndexOffset; // Frame offset for animation\n        \n        uniform mat4 uModelViewMatrix;\n        uniform mat4 uProjectionMatrix;\n\n        attribute vec2 aTextureCoord;\n        varying highp vec2 vTextureCoord;\n\n        void main() {\n            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n            highp float u = uAtlasSize.x / uFrameSize.x;\n            highp float v = uAtlasSize.y / uFrameSize.y;\n            float f_index = aFrameIndex + uFrameIndexOffset;\n            // frame pos (0,0) on atlas\n            vec2 fu = vec2(mod(f_index,u) / u,floor(f_index/v)/v);\n\n            vTextureCoord = fu + vec2(aTextureCoord.x/u,aTextureCoord.y/v);\n            //vTextureCoord = ;\n        }\n        ";
        AnimatedTextureMaterial.FS_SSRC = "\n        varying highp vec2 vTextureCoord;\n        uniform sampler2D uSampler;\n        void main() {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n        }\n    ";
        return AnimatedTextureMaterial;
    }(Material));
    exports.AnimatedTextureMaterial = AnimatedTextureMaterial;
});
//# sourceMappingURL=material.js.map