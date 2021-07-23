define(["require", "exports", "tile3d/webgl/webglmanager"], function (require, exports, webglmanager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tile3D = /** @class */ (function () {
        function Tile3D(config) {
            var context3D = config.canvas.getContext("webgl");
            this.glManager = new webglmanager_1.WebGLManager(context3D);
        }
        return Tile3D;
    }());
    exports.Tile3D = Tile3D;
});
//# sourceMappingURL=tile3d.js.map