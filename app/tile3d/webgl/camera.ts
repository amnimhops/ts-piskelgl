import { mat4 } from "gl-matrix";
import { Entity } from "./entity";

class Camera extends Entity{
    private projection:mat4;
    public static perspective(fov:number,width:number,height:number,znear:number,zfar:number){
        const mat = mat4.create();
        mat4.perspective(mat,fov * Math.PI / 180, width/height, znear,zfar);
        return new Camera(mat);
    }

    public static ortho(left:number,right:number,bottom:number,top:number,near:number,far:number){
        const mat = mat4.create();
        mat4.ortho(mat,left,right,bottom,top,near,far);
        
        return new Camera(mat);
    }

    private constructor(projectionMatrix:mat4){
        super();
        this.projection = projectionMatrix
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