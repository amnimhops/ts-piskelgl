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
define(["require", "exports", "gl-matrix", "./entity"], function (require, exports, gl_matrix_1, entity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Camera = /** @class */ (function (_super) {
        __extends(Camera, _super);
        function Camera(fov, width, height, znear, zfar) {
            var _this = _super.call(this) || this;
            _this.projection = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.perspective(_this.projection, fov * Math.PI / 180, width / height, znear, zfar);
            return _this;
        }
        Camera.prototype.getViewProjectionMatrix = function () {
            var viewProjectionMatrix = gl_matrix_1.mat4.create();
            var invertedMatrix = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.invert(invertedMatrix, this.matrix);
            gl_matrix_1.mat4.mul(viewProjectionMatrix, this.projection, invertedMatrix);
            return viewProjectionMatrix;
        };
        return Camera;
    }(entity_1.Entity));
    exports.Camera = Camera;
});
//# sourceMappingURL=camera.js.map