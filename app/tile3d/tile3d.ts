import {WebGLManager} from 'tile3d/webgl/webglmanager';

interface Tile3DConfig{
    /**
     * Canvas element in which the map will be drawn
     */
    canvas:HTMLCanvasElement;
    /**
     * width/height in pixels for each tile
     */
    size:number;
    /**
     * Number of horizontal tiles
     */
    width:number;
    /**
     * Number of vertical tiles
     */
    height:number;
}

class Tile3D{
    glManager:WebGLManager;

    constructor(config:Tile3DConfig){
        const context3D  = config.canvas.getContext("webgl");
        this.glManager = new WebGLManager(context3D);
        
    }
}

export {
    Tile3D,
    Tile3DConfig
}