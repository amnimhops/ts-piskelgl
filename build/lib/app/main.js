define(["require", "exports", "tile3d/tile3d", "tile3d/webgl/camera", "tile3d/webgl/geometry", "tile3d/webgl/material", "tile3d/piskel/piskel"], function (require, exports, tile3d_1, camera_1, geometry_1, material_1, piskel) {
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
        var materials = [
            { name: 'red', mat: new material_1.ColorMaterial([1, 0, 0, 1]) },
            { name: 'green', mat: new material_1.ColorMaterial([0, 1, 0, 1]) },
            { name: 'blue', mat: new material_1.ColorMaterial([0, 0, 1, 1]) },
            { name: 'tex', mat: new material_1.TextureMaterial(t3d.glManager.getTexture("prueba")) },
            { name: 'atex', mat: new material_1.AnimatedTextureMaterial(t3d.glManager.getTexture("prueba"), [32, 32], 0) }
        ];
        materials.forEach(function (color) { return t3d.glManager.addMaterial(color.name, color.mat); });
        var camera = new camera_1.Camera(45, canvas.clientWidth, canvas.clientHeight, 0.1, 100);
        camera.translate([2, 2, 15]);
        //camera.rotate(45,[0,1,0]);
        //camera.rotate(15,[0,1,1]);
        t3d.glManager.setCamera(camera);
        /*t3d.glManager.addGeometry("q1",quad([-1,0,0],1.5,1),"atex");
        t3d.glManager.addGeometry("q2",quad([1,0,0],1.5,4),"atex");*/
        //t3d.glManager.addGeometry("cylinder",cylinder([0,0,1],1,1,13),"red");
        //t3d.glManager.addGeometry("cylinder2",cylinder([1,1,0],1,1,13),"red");
        t3d.glManager.addGeometry("q2", geometry_1.quad([1, 0, 0], 1.5), "red");
        t3d.glManager.addGeometry("q", geometry_1.quad([3, 0, 2], 1), "green");
        /*for(let c=0;c<10*10;c++){
            const [x,y] = [c%10,Math.floor(c/10)];
            const position:vec3 = [x,y,0];
            const size = 1
            const frameIndex = c%9; // number of frames in this atlas
            // const matKey = materials[Math.floor(Math.random() * materials.length)].name;
            t3d.glManager.addGeometry("q"+c,quad(position,size,frameIndex),"tex");
        }*/
        var last = null;
        var FPS = 25;
        var tpf = 1000 / 25;
        var framesPainted = 0;
        var timeElapsed = 0;
        function draw_fn(timestamp) {
            last = timestamp;
            t3d.glManager.render();
            t3d.glManager.geometries["cylinder"].rotate(0.1, [0, 1, 0]);
            window.requestAnimationFrame(draw_fn);
        }
        window.requestAnimationFrame(draw_fn);
    };
    image.src = "/build/assets/terrain.png";
    var model = {
        atlasW: 128,
        atlasH: 128,
        frameW: 32,
        frameH: 32,
        compute: function (index) {
            var x = index % (this.atlasW / this.frameW);
            var y = Math.floor(index / (this.atlasH / this.frameH));
            return { x: x, y: y };
        }
    };
    for (var x = 0; x < 16; x++) {
        console.log(x, model.compute(x));
    }
    fetch("/build/assets/running.piskel")
        .then(function (response) {
        return response.json();
    })
        .then(function (data) {
        console.log(piskel.PiskelLoader.load(data));
    })
        .catch(function (err) {
        console.error(err);
    });
});
//# sourceMappingURL=main.js.map