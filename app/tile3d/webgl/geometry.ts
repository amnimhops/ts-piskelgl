import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { Entity } from "./entity";

/**
 * This class explains how vertex buffer information is organized.
 * Each vertex has 4 attributes: position, normals, texture coordinates and color.
 * - Vertex position is located at the first three floats on the float buffer.
 * - Normal values are stored next to vertex position as other three floats.
 * - UV coordinates are the next two floats
 * - Finally, the RGBA color value is stored as the last four floats.
 */
class VertexBufferModel{
    
    static VERTEX_BYTE_SIZE:number = 3 + 2
    static NORMAL_OFFSET:number = Float32Array.BYTES_PER_ELEMENT * 3;
    static UV_OFFSET:number = Float32Array.BYTES_PER_ELEMENT * (3+3); 
    static COLOR_OFFSET:number = Float32Array.BYTES_PER_ELEMENT * (3+3+2);
}
/**
 * This interface defines which vertex attributes will be used in 
 * the shader program
 */
interface VertexAttributeInfo{
    /**
     * If true, shader can use vertex normal data supplied in the vertex buffer
     */
    normal?:boolean;
    /**
     * If true, shader can use UV information supplied in the vertex buffer
     */
    uv?:boolean;
    /**
     * If true, shader can use vertex color data supplied in each vertex
     */
    color?:boolean;
};

class Geometry extends Entity{
    visible:boolean = true;
    faceCount:number;
    vertexCount:number;
    vertexBuffer:WebGLBuffer;
    indexBuffer:WebGLBuffer;
    attributeInfo:VertexAttributeInfo;

    constructor(private vertexData:number[],private faces:number[],attributeInfo:VertexAttributeInfo = {uv:false,normal:false,color:false}){
        super();
        this.vertexCount = this.vertexData.length / VertexBufferModel.VERTEX_BYTE_SIZE ; // 5 floats per vertex
        this.faceCount = this.faces.length / 3; //  3 ints per face
        // Notice that we keep a reference to the original data @ this.vertexData
        // If geometry is never updated, it would be better if we build
        // here the buffer, leaving the data to the garbage collector.
        // To do that, we will need the rendering context in the constructor.
        this.attributeInfo = attributeInfo;
    }


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

function vertex(pos:vec3,uv:vec2=[0,0],rgba:vec4=[1,1,1,1]):number[]{
    return [].concat(...pos as number[],...uv as number[]);
}
function quad(pos:vec3,size:number,uvOffset:[vec2,vec2]=[[0,0],[1,1]]):Geometry{
    const hs = size / 2;
    const vertices = [
        vertex([pos[0] - hs, pos[1] - hs, pos[2]], [uvOffset[0][0] , uvOffset[0][1] ]),
        vertex([pos[0] - hs, pos[1] + hs, pos[2]], [uvOffset[0][0] , uvOffset[1][1] ]),
        vertex([pos[0] + hs, pos[1] + hs, pos[2]], [uvOffset[1][0] , uvOffset[1][1] ]),
        vertex([pos[0] + hs, pos[1] - hs, pos[2]], [uvOffset[1][0] , uvOffset[0][1] ])
    ]
    
    return new Geometry([].concat(...vertices),[
        0, 1, 2,
        2, 3, 0
    ]);
}

function cylinder(pos:vec3,radius:number,length:number,steps:number=3):Geometry{
    const bottomCap:number[][] = [];
    const topCap:number[][] = [];
    const faces:number[] = [];

    bottomCap.push(vertex([0,0,0]));
    topCap.push(vertex([0,length,0]));

    /**
     * Build the cylinder base by increasing the vertex rotation based on
     * the number of given steps
     */
    for(let c=0;c<steps;c++) {
        const rotation = 2 * Math.PI * c / steps; console.log(rotation);
        const [cosr,sinr] = [Math.cos(rotation),Math.sin(rotation)];
        bottomCap.push(vertex([cosr*radius,0,sinr*radius]));
        topCap.push(vertex([cosr*radius,length,sinr*radius]));
    }

    /**
     * The first vertex of the top cap is after the last vertex of the bottom one
     */
    const topCapOffset = bottomCap.length;

    for(let c=1;c<steps+1;c++){
        const o1 = 0; const o2 = topCapOffset;
        const a1 = c; const a2 = topCapOffset+c;
        const b1 = c%steps+1; const b2 = topCapOffset+c%steps+1;
        // Bottom cap
        faces.push(o1,a1,b1);
        // Top cap
        faces.push(o2,a2,b2);
        // Envelope
        faces.push(a1,a2,b1);
        faces.push(a2,b2,b1);

    }
    
    // Flatten the vertex data and return its values
    const geometry = new Geometry([].concat(...bottomCap,...topCap),faces);
    geometry.translate(pos);

    return geometry;

}

//function quad(pos:vec3,width:number,height:number)

export {
    VertexAttributeInfo,
    VertexBufferModel,
    Geometry,
    quad,
    cylinder
}