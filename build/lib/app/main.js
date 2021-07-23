define(["require", "exports", "tile3d/tile3d"], function (require, exports, tile3d_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = 'black';
    document.body.appendChild(canvas);
    var t3d = new tile3d_1.Tile3D({
        canvas: canvas,
        size: 64,
        width: 100,
        height: 100
    });
    var image = new Image();
    image.onload = function (event) {
        console.log('fuuu');
        t3d.glManager.createTexture("prueba", image);
        t3d.glManager.render();
    };
    image.src = "../assets/tex0.jpg";
});
//# sourceMappingURL=main.js.map