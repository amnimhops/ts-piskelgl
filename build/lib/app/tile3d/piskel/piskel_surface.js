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
    var PiskelSurface = /** @class */ (function (_super) {
        __extends(PiskelSurface, _super);
        function PiskelSurface() {
            return _super.call(this, [], []) || this;
        }
        return PiskelSurface;
    }(geometry_1.Geometry));
});
//# sourceMappingURL=piskel_surface.js.map