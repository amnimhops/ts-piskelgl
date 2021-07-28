define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Entity = /** @class */ (function () {
        function Entity(translation, rotation, scalation) {
            if (translation === void 0) { translation = undefined; }
            if (rotation === void 0) { rotation = undefined; }
            if (scalation === void 0) { scalation = undefined; }
            this.translation = translation || gl_matrix_1.mat4.create();
            this.rotation = rotation || gl_matrix_1.mat4.create();
            this.scalation = scalation || gl_matrix_1.mat4.create();
        }
        Entity.prototype.rotate = function (angle, axis) {
            gl_matrix_1.mat4.rotate(this.rotation, this.rotation, angle * Math.PI / 180, axis);
        };
        Entity.prototype.translate = function (position) {
            gl_matrix_1.mat4.translate(this.translation, this.translation, position);
        };
        Entity.prototype.scale = function (amount) {
            gl_matrix_1.mat4.scale(this.scalation, this.scalation, amount);
        };
        Object.defineProperty(Entity.prototype, "matrix", {
            get: function () {
                var mtx = gl_matrix_1.mat4.create();
                gl_matrix_1.mat4.multiply(mtx, this.scalation, this.rotation);
                gl_matrix_1.mat4.multiply(mtx, mtx, this.translation);
                return mtx;
            },
            enumerable: true,
            configurable: true
        });
        return Entity;
    }());
    exports.Entity = Entity;
});
//# sourceMappingURL=entity.js.map