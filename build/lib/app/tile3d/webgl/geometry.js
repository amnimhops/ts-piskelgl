var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./entity"], function (require, exports, entity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This class explains how vertex buffer information is organized.
     * Each vertex has 4 attributes: position, normals, texture coordinates and color.
     * - Vertex position is located at the first three floats on the float buffer.
     * - Normal values are stored next to vertex position as other three floats.
     * - UV coordinates are the next two floats
     * - Finally, the RGBA color value is stored as the last four floats.
     */
    var VertexBufferModel = /** @class */ (function () {
        function VertexBufferModel() {
        }
        VertexBufferModel.VERTEX_BYTE_SIZE = 3 + 2;
        VertexBufferModel.NORMAL_OFFSET = Float32Array.BYTES_PER_ELEMENT * 3;
        VertexBufferModel.UV_OFFSET = Float32Array.BYTES_PER_ELEMENT * (3 + 3);
        VertexBufferModel.COLOR_OFFSET = Float32Array.BYTES_PER_ELEMENT * (3 + 3 + 2);
        return VertexBufferModel;
    }());
    exports.VertexBufferModel = VertexBufferModel;
    ;
    var Geometry = /** @class */ (function (_super) {
        __extends(Geometry, _super);
        function Geometry(vertexData, faces, attributeInfo) {
            if (attributeInfo === void 0) { attributeInfo = { uv: false, normal: false, color: false }; }
            var _this = _super.call(this) || this;
            _this.vertexData = vertexData;
            _this.faces = faces;
            _this.vertexCount = _this.vertexData.length / VertexBufferModel.VERTEX_BYTE_SIZE; // 5 floats per vertex
            _this.faceCount = _this.faces.length / 3; //  3 ints per face
            // Notice that we keep a reference to the original data @ this.vertexData
            // If geometry is never updated, it would be better if we build
            // here the buffer, leaving the data to the garbage collector.
            // To do that, we will need the rendering context in the constructor.
            _this.attributeInfo = attributeInfo;
            return _this;
        }
        Geometry.prototype.build = function (gl) {
            if (this.vertexBuffer != null) {
                throw new Error("Geometry already built");
            }
            this.vertexBuffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), gl.STATIC_DRAW);
        };
        return Geometry;
    }(entity_1.Entity));
    exports.Geometry = Geometry;
    function vertex(pos, uv, rgba) {
        if (uv === void 0) { uv = [0, 0]; }
        if (rgba === void 0) { rgba = [1, 1, 1, 1]; }
        return [].concat.apply([], pos.concat(uv));
    }
    function quad(pos, size, uvOffset) {
        if (uvOffset === void 0) { uvOffset = [0, 0]; }
        var hs = size / 2;
        var vertices = [
            vertex([pos[0] - hs, pos[1] - hs, pos[2]], [uvOffset[0] + 0, uvOffset[1] + 0]),
            vertex([pos[0] - hs, pos[1] + hs, pos[2]], [uvOffset[0] + 0, uvOffset[1] + 1]),
            vertex([pos[0] + hs, pos[1] + hs, pos[2]], [uvOffset[0] + 1, uvOffset[1] + 1]),
            vertex([pos[0] + hs, pos[1] - hs, pos[2]], [uvOffset[0] + 1, uvOffset[1] + 0])
        ];
        return new Geometry([].concat.apply([], vertices), [
            0, 1, 2,
            2, 3, 0
        ]);
    }
    exports.quad = quad;
    function cylinder(pos, radius, length, steps) {
        if (steps === void 0) { steps = 3; }
        var bottomCap = [];
        var topCap = [];
        var faces = [];
        bottomCap.push(vertex([0, 0, 0]));
        topCap.push(vertex([0, length, 0]));
        /**
         * Build the cylinder base by increasing the vertex rotation based on
         * the number of given steps
         */
        for (var c = 0; c < steps; c++) {
            var rotation = 2 * Math.PI * c / steps;
            console.log(rotation);
            var _a = [Math.cos(rotation), Math.sin(rotation)], cosr = _a[0], sinr = _a[1];
            bottomCap.push(vertex([cosr * radius, 0, sinr * radius]));
            topCap.push(vertex([cosr * radius, length, sinr * radius]));
        }
        /**
         * The first vertex of the top cap is after the last vertex of the bottom one
         */
        var topCapOffset = bottomCap.length;
        for (var c = 1; c < steps + 1; c++) {
            var o1 = 0;
            var o2 = topCapOffset;
            var a1 = c;
            var a2 = topCapOffset + c;
            var b1 = c % steps + 1;
            var b2 = topCapOffset + c % steps + 1;
            // Bottom cap
            faces.push(o1, a1, b1);
            // Top cap
            faces.push(o2, a2, b2);
            // Envelope
            faces.push(a1, a2, b1);
            faces.push(a2, b2, b1);
        }
        // Flatten the vertex data and return its values
        var geometry = new Geometry([].concat.apply([], bottomCap.concat(topCap)), faces);
        geometry.translate(pos);
        return geometry;
    }
    exports.cylinder = cylinder;
});
//# sourceMappingURL=geometry.js.map