define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PiskelLoader = void 0;
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
    var PiskelSurface = /** @class */ (function () {
        function PiskelSurface() {
        }
        return PiskelSurface;
    }());
    var PiskelMaterial = /** @class */ (function () {
        function PiskelMaterial() {
        }
        return PiskelMaterial;
    }());
});
//# sourceMappingURL=piskel.js.map