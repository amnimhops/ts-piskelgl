import {Tile3D} from 'tile3d/tile3d';

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
    t3d.glManager.render();
}
image.src = "../assets/tex0.jpg";
