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
define(["require", "exports", "tile3d/webgl/geometry"], function (require, exports, geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PiskelLoader = /** @class */ (function () {
        function PiskelLoader() {
        }
        PiskelLoader.load = function (data) {
            return PiskelLoader.parseFile(data);
        };
        PiskelLoader.fubar = function (data) {
            var piskel = PiskelLoader.load(data);
            //piskel.
        };
        PiskelLoader.parseLayer = function (data) {
            var jsonData = JSON.parse(data);
            var layer = {
                chunks: [],
                frameCount: jsonData['frameCount'],
                name: jsonData['name'],
                opacity: jsonData['opacity']
            };
            layer.chunks.push(jsonData['chunks'].map(function (chunk) { return chunk; }));
            return layer;
        };
        PiskelLoader.parseFile = function (jsonData) {
            var file = {
                modelVersion: jsonData['modelVersion'],
                piskel: {
                    description: jsonData['description'],
                    fps: jsonData['fps'],
                    height: jsonData['height'],
                    width: jsonData['width'],
                    layers: []
                }
            };
            // we will have to rebuild jsonData.layers since layer data is stored as a stringyfied object
            file.piskel.layers.push(jsonData.piskel.layers.map(PiskelLoader.parseLayer));
            return file;
        };
        return PiskelLoader;
    }());
    exports.PiskelLoader = PiskelLoader;
    var PiskelSurface = /** @class */ (function (_super) {
        __extends(PiskelSurface, _super);
        function PiskelSurface() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return PiskelSurface;
    }(geometry_1.Geometry));
    var PiskelMaterial = /** @class */ (function () {
        function PiskelMaterial() {
        }
        return PiskelMaterial;
    }());
});
//# sourceMappingURL=piskel.js.map