define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TileMap = exports.Tile = exports.Layer = void 0;
    var Tile = /** @class */ (function () {
        function Tile() {
        }
        Tile.FLIP_V = 0;
        Tile.FLIP_H = 1;
        return Tile;
    }());
    exports.Tile = Tile;
    var Layer = /** @class */ (function () {
        function Layer(width, height) {
            this.width = width;
            this.height = height;
            this.tiles = new Tile[this.width * this.height];
        }
        Layer.prototype.setTile = function (tile, x, y) {
            this.tiles[y * this.width + x] = tile;
        };
        Layer.prototype.getTile = function (x, y) {
            return this.tiles[y * this.width + x];
        };
        return Layer;
    }());
    exports.Layer = Layer;
    var TileMap = /** @class */ (function () {
        function TileMap(config) {
        }
        TileMap.prototype.addLayer = function (layer) {
            this.layers.push(layer);
        };
        TileMap.prototype.getTiles = function (x, y) {
            var tiles = Tile[this.layers.length];
            for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                tiles.push(layer.getTile(x, y));
            }
            return tiles;
        };
        return TileMap;
    }());
    exports.TileMap = TileMap;
});
//# sourceMappingURL=map.js.map