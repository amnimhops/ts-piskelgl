import { vec3 } from 'gl-matrix';
import {Tile3D} from 'tile3d/tile3d';
import { Camera } from 'tile3d/webgl/camera';
import { Geometry,quad } from 'tile3d/webgl/geometry';
import { AnimatedTextureMaterial, ColorMaterial, TextureMaterial } from 'tile3d/webgl/material';
import { Scene } from 'tile3d/webgl/scene';

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';
document.body.appendChild(canvas);

const t3d = new Tile3D({
    canvas,
    size:64,
    width:100,
    height:100
});

const image = new Image();
image.onload = function(event) {
    console.log('fuuu');
    t3d.glManager.createTexture("prueba",image);

        const materials = [
            {name:'red',mat:new ColorMaterial([1,0,0,1])},
            {name:'green',mat:new ColorMaterial([0,1,0,1])},
            {name:'blue',mat:new ColorMaterial([0,0,1,1])},
            {name:'tex',mat:new TextureMaterial(t3d.glManager.getTexture("prueba"))},
            {name:'atex',mat:new AnimatedTextureMaterial(t3d.glManager.getTexture("prueba"),[32,32],0)}
        ]
        materials.forEach( color => t3d.glManager.addMaterial(color.name,color.mat));
        
        const camera = new Camera(45,canvas.clientWidth,canvas.clientHeight,0.1,100);
        camera.translate([5,5,15]);
        //camera.rotate(15,[0,1,1]);

        t3d.glManager.setCamera(camera);
        /*t3d.glManager.addGeometry("q1",quad([-1,0,0],1.5,1),"atex");
        t3d.glManager.addGeometry("q2",quad([1,0,0],1.5,4),"atex");*/
        
        for(let c=0;c<10*10;c++){
            const [x,y] = [c%10,Math.floor(c/10)];
            const position:vec3 = [x,y,0];
            const size = 1
            const frameIndex = c%9; // number of frames in this atlas
           // const matKey = materials[Math.floor(Math.random() * materials.length)].name;
            t3d.glManager.addGeometry("q"+c,quad(position,size,frameIndex),"atex");
        }

        let last = null;
        const FPS = 25;
        const tpf = 1000/25;
        let framesPainted = 0;
        let timeElapsed = 0;

        function draw_fn(timestamp){
          
            last = timestamp;
            t3d.glManager.render();
            t3d.glManager.camera.rotate(0.1,[0,0,1]);
            window.requestAnimationFrame(draw_fn);
        }
        window.requestAnimationFrame(draw_fn);
}
image.src = "/build/assets/terrain.png";

const model = {
    atlasW : 128,
    atlasH : 128,
    frameW : 32,
    frameH : 32,
    compute:function(index){
        const x = index % (this.atlasW / this.frameW)
        const y = Math.floor(index / (this.atlasH / this.frameH))
        return {x,y}
    }

    
}

for(let x=0;x<16;x++){
    console.log(x,model.compute(x))
}

