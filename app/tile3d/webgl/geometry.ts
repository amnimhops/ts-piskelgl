import { mat4, vec3 } from "gl-matrix";
import { Entity } from "./entity";

class Geometry extends Entity{

    //matrix:mat4; 
    faceCount:number;
    vertexCount:number;
    vertexBuffer:WebGLBuffer;
    indexBuffer:WebGLBuffer;
    /**
     * 
     * @param vertexData Vertex data in packets of 6 floats: x y z u v i
     * @param faces 
     */
    constructor(private vertexData:number[],private faces:number[]){
        super();
        this.vertexCount = this.vertexData.length / 6; // 5 floats per vertex
        this.faceCount = this.faces.length / 3; //  3 ints per face
        //this.matrix = mat4.create();
    }

    /*translate(position:vec3){
        mat4.translate(this.matrix,this.matrix,position);
    }*/

    build(gl:WebGLRenderingContext){
        if(this.vertexBuffer != null){
            throw new Error("Geometry already built");
        }
 
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData),gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.faces),gl.STATIC_DRAW);
    }
}

function quad(pos:vec3,size:number, textureIndex:number = 0):Geometry{
    const hs = size / 2;
    return new Geometry([
        pos[0] - hs, pos[1] - hs, pos[2], 0, 0, textureIndex,
        pos[0] - hs, pos[1] + hs, pos[2], 0, 1, textureIndex,
        pos[0] + hs, pos[1] + hs, pos[2], 1, 1, textureIndex,
        pos[0] + hs, pos[1] - hs, pos[2], 1, 0, textureIndex
    ],[
        0, 1, 2,
        2, 3, 0
    ]);
}

export {
    Geometry,
    quad
}