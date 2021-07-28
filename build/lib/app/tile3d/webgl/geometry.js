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
    var Vertex = /** @class */ (function () {
        function Vertex(pos, normal, uv, color) {
            if (normal === void 0) { normal = [0, 0, 0]; }
            if (uv === void 0) { uv = [0, 0]; }
            if (color === void 0) { color = [0, 0, 0, 0]; }
            this.data = pos.concat(normal, uv, color);
        }
        return Vertex;
    }());
    var Geometry = /** @class */ (function (_super) {
        __extends(Geometry, _super);
        /**
         *
         * @param vertexData Vertex data in packets of 6 floats: x y z u v i
         * @param faces
         */
        function Geometry(vertexData, faces) {
            var _this = _super.call(this) || this;
            _this.vertexData = vertexData;
            _this.faces = faces;
            _this.vertexCount = _this.vertexData.length / 6; // 5 floats per vertex
            _this.faceCount = _this.faces.length / 3; //  3 ints per face
            return _this;
        }
        /*translate(position:vec3){
            mat4.translate(this.matrix,this.matrix,position);
        }*/
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
    function quad(pos, size, textureIndex) {
        if (textureIndex === void 0) { textureIndex = 0; }
        var hs = size / 2;
        return new Geometry([
            pos[0] - hs, pos[1] - hs, pos[2], 0, 0, textureIndex,
            pos[0] - hs, pos[1] + hs, pos[2], 0, 1, textureIndex,
            pos[0] + hs, pos[1] + hs, pos[2], 1, 1, textureIndex,
            pos[0] + hs, pos[1] - hs, pos[2], 1, 0, textureIndex
        ], [
            0, 1, 2,
            2, 3, 0
        ]);
    }
    exports.quad = quad;
});
//# sourceMappingURL=geometry.js.map