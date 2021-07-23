import { TileMap } from "tile3d/map";
import {mat4, vec3} from 'gl-matrix';

type TextureMap = Record<string,WebGLTexture>;

interface Material{

}
class TextureMaterial implements Material{

}
class ColorMaterial implements Material{

}
class Geometry{
    vertices:number[][];
    faces:number[];
    
    constructor(){

    }
}

function loadShader(gl:WebGLRenderingContext,type:number,source:string):WebGLShader{
    const shader:WebGLShader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        gl.deleteShader(shader);
        throw new Error('Error compiling shader:'+gl.getShaderInfoLog(shader));
    }

    return shader;
}

function initShaders(gl:WebGLRenderingContext,vsSource:string,fsSource:string):WebGLProgram{
    const vs = loadShader(gl,gl.VERTEX_SHADER,vsSource);
    const fs = loadShader(gl,gl.FRAGMENT_SHADER,fsSource);

    const program = gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        throw new Error('Error initializing shaders:'+gl.getProgramInfoLog(program));
    }

    return program;
}

export class WebGLManager{
    gl:WebGLRenderingContext;
    textures:TextureMap = {};

    constructor(context:WebGLRenderingContext){
        this.gl = context;
     }

    createTexture(name:string,image:HTMLImageElement){
        if(this.textures[name] != undefined){
            throw new Error(`texture ${name} already defined`);
        }

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D,texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,true);
        this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,image);
        // TODO: Need to check if webgl does support mipmapping with npot textures
        // https://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this.textures[name] = texture;
        
    }

    render(){
        // Context initialization
        this.gl.clearColor(0,0,0,1);
        this.gl.clearDepth(1)
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
        
        // Camera setup
        const projectionMatrix:mat4 = mat4.create();
        mat4.perspective(projectionMatrix, 45 * Math.PI / 180,this.gl.canvas.width/this.gl.canvas.height,0.1,100);
        
        // Buffer population with vertices
        const buffer:WebGLBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,buffer);

        const points:number[] =[
            0,1,
            1,1,
            0,0,
            1,0
          ];

        const modelViewMatrix:mat4 = mat4.create();
        mat4.translate(modelViewMatrix,modelViewMatrix,[0.0, 0.0, -2.0]); // See later why this is negative

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(points),this.gl.STATIC_DRAW);

        // Texture coordinates buffer
        const txCoords:number[] = [
            0,1,
            1,1,
            0,0,
            1,0
        ];
        const txCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,txCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(txCoords),this.gl.STATIC_DRAW);
        // Compile shaders
        const vsSource = `
            attribute vec4 aVertexPosition;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            attribute vec2 aTextureCoord;
            varying highp vec2 vTextureCoord;

            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `;

        const fsSource = `
            varying highp vec2 vTextureCoord;
            uniform sampler2D uSampler;

            void main() {
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;

        const program:WebGLProgram = initShaders(this.gl,vsSource,fsSource);
        
        this.gl.useProgram(program);

        const vertexPositionAttribute = this.gl.getAttribLocation(program,"aVertexPosition");
        const aTextureCoordAttribute = this.gl.getAttribLocation(program,"aTextureCoord");
        const uProjectionMatrixAttribute = this.gl.getUniformLocation(program,"uProjectionMatrix");
        const uSampler = this.gl.getUniformLocation(program,"uSampler");
        const uModelViewMatrixAttribute = this.gl.getUniformLocation(program,"uModelViewMatrix");
        
        // 1.- Vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,buffer);
        this.gl.vertexAttribPointer(vertexPositionAttribute,2,this.gl.FLOAT,false,0,0);// TODO review later, this is tied to the buffer topology
        this.gl.enableVertexAttribArray(vertexPositionAttribute);

        // 2.- TextCoord buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,txCoordBuffer);
        this.gl.vertexAttribPointer(aTextureCoordAttribute,2,this.gl.FLOAT,false,0,0);
        this.gl.enableVertexAttribArray(aTextureCoordAttribute);

        // 3.- Activate texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.textures['prueba']);
        
        // Uniforms
        this.gl.uniform1i(uSampler,0); // 0 is the texture ID
        this.gl.uniformMatrix4fv(uProjectionMatrixAttribute,false,projectionMatrix);
        this.gl.uniformMatrix4fv(uModelViewMatrixAttribute,false,modelViewMatrix);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4);

       



        
    }
}