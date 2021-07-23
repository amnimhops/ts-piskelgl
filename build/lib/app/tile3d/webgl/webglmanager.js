define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextureMaterial = /** @class */ (function () {
        function TextureMaterial() {
        }
        return TextureMaterial;
    }());
    var ColorMaterial = /** @class */ (function () {
        function ColorMaterial() {
        }
        return ColorMaterial;
    }());
    var Geometry = /** @class */ (function () {
        function Geometry() {
        }
        return Geometry;
    }());
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
    var WebGLManager = /** @class */ (function () {
        function WebGLManager(context) {
            this.textures = {};
            this.gl = context;
        }
        WebGLManager.prototype.createTexture = function (name, image) {
            if (this.textures[name] != undefined) {
                throw new Error("texture " + name + " already defined");
            }
            var texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            // TODO: Need to check if webgl does support mipmapping with npot textures
            // https://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
            // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.textures[name] = texture;
        };
        WebGLManager.prototype.render = function () {
            // Context initialization
            this.gl.clearColor(0, 0, 0, 1);
            this.gl.clearDepth(1);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            // Camera setup
            var projectionMatrix = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.perspective(projectionMatrix, 45 * Math.PI / 180, this.gl.canvas.width / this.gl.canvas.height, 0.1, 100);
            // Buffer population with vertices
            var buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            var points = [
                0, 1, 0, 0, 1,
                1, 1, 0, 1, 1,
                0, 0, 0, 0, 0,
                1, 0, 0, 1, 0
            ];
            var modelViewMatrix = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]); // See later why this is negative
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(points), this.gl.STATIC_DRAW);
            // Texture coordinates buffer
            /*const txCoords:number[] = [
                0,1,
                1,1,
                0,0,
                1,0
            ];*/
            //const txCoordBuffer = this.gl.createBuffer();
            //this.gl.bindBuffer(this.gl.ARRAY_BUFFER,txCoordBuffer);
            //this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(txCoords),this.gl.STATIC_DRAW);
            // Compile shaders
            var vsSource = "\n            attribute vec4 aVertexPosition;\n            \n            uniform mat4 uModelViewMatrix;\n            uniform mat4 uProjectionMatrix;\n\n            attribute vec2 aTextureCoord;\n            varying highp vec2 vTextureCoord;\n\n            void main() {\n                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n                vTextureCoord = aTextureCoord;\n            }\n        ";
            var fsSource = "\n            varying highp vec2 vTextureCoord;\n            uniform sampler2D uSampler;\n\n            void main() {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n            }\n        ";
            var program = initShaders(this.gl, vsSource, fsSource);
            this.gl.useProgram(program);
            var vertexPositionAttribute = this.gl.getAttribLocation(program, "aVertexPosition");
            var aTextureCoordAttribute = this.gl.getAttribLocation(program, "aTextureCoord");
            var uProjectionMatrixAttribute = this.gl.getUniformLocation(program, "uProjectionMatrix");
            var uSampler = this.gl.getUniformLocation(program, "uSampler");
            var uModelViewMatrixAttribute = this.gl.getUniformLocation(program, "uModelViewMatrix");
            // 1.- Vertex buffer
            // Multidimensional buffer https://stackoverflow.com/questions/16887278/webgl-vertex-buffer-with-more-than-4-dimensional-coordinates
            var numDimensions = 3 + 2; // x y z u v
            var floatSize = Float32Array.BYTES_PER_ELEMENT;
            var itemSize = floatSize * numDimensions;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(vertexPositionAttribute, 3, this.gl.FLOAT, false, itemSize, 0); // first 3 floats
            this.gl.vertexAttribPointer(aTextureCoordAttribute, 2, this.gl.FLOAT, false, itemSize, 3 * floatSize); // skip 3 floats, next 2 floats
            this.gl.enableVertexAttribArray(vertexPositionAttribute);
            this.gl.enableVertexAttribArray(aTextureCoordAttribute);
            // 2.- TextCoord buffer
            /*this.gl.bindBuffer(this.gl.ARRAY_BUFFER,txCoordBuffer);
            this.gl.vertexAttribPointer(aTextureCoordAttribute,2,this.gl.FLOAT,false,0,0);
           */
            // 3.- Activate texture
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['prueba']);
            // Uniforms
            this.gl.uniform1i(uSampler, 0); // 0 is the texture ID
            this.gl.uniformMatrix4fv(uProjectionMatrixAttribute, false, projectionMatrix);
            this.gl.uniformMatrix4fv(uModelViewMatrixAttribute, false, modelViewMatrix);
            // Draw
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        };
        return WebGLManager;
    }());
    exports.WebGLManager = WebGLManager;
});
//# sourceMappingURL=webglmanager.js.map