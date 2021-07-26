import { mat4 } from "gl-matrix";
import { Entity } from "./entity";

class Camera extends Entity{
    private projection:mat4;
    constructor(fov:number,width:number,height:number,znear:number,zfar:number){
        super();
        this.projection = mat4.create();
        mat4.perspective(this.projection,fov * Math.PI / 180, width/height, znear,zfar);
    }

    getViewProjectionMatrix(){
        const viewProjectionMatrix:mat4 = mat4.create();
        const invertedMatrix:mat4 = mat4.create();
        
        mat4.invert(invertedMatrix,this.matrix);
        mat4.mul(viewProjectionMatrix,this.projection,invertedMatrix);

        return viewProjectionMatrix;
    }
}

export{
    Camera
}