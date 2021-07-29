
import {mat4, vec3, vec4} from 'gl-matrix';
import { ColorMaterial, Material, MaterialParams, Texture, TextureMaterial } from "./material";
import { Geometry } from "./geometry";
import { Scene } from './scene';
import { Entity } from './entity';
import { Camera } from './camera';

type TextureMap = Record<string,Texture>;

export class WebGLManager{
    gl:WebGLRenderingContext;
    textures:TextureMap = {};
    scene:Scene;
    materials:Record<string,Material> = {};
    geometries:Record<string,Geometry> = {};
    renderQueue:Record<string,Geometry[]> = {};
    camera:Camera;
    addMaterial(name:string,material:Material){
        if(this.materials[name] !== undefined){
            throw new Error(`Material ${name} already added`);
        }

        this.materials[name] = material;
        this.renderQueue[name] = [];
    }

    addGeometry(name:string,geometry:Geometry,pname:string){
        if(this.geometries[name] !== undefined){
            throw new Error(`Geometry ${name} already added`);
        }
        if(this.materials[pname] == undefined){
            throw new Error(`Program ${pname} not defined`);
        }

        this.geometries[name] = geometry;
        this.renderQueue[pname].push(geometry);
        
        geometry.build(this.gl);
    }

    setCamera(camera:Camera){
        this.camera = camera;
    }
    
    constructor(context:WebGLRenderingContext){
        this.gl = context;
     }

     getTexture(name:string):Texture{
         if(this.textures[name] == undefined){
             throw new Error(`Texture ${name} not found`);
         }

         return this.textures[name];
     }

    createTexture(name:string,image:HTMLImageElement){
        if(this.textures[name] != undefined){
            throw new Error(`texture ${name} already defined`);
        }

        const glTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D,glTexture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,true);
        this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,image);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE);
        // TODO: Need to check if webgl does support mipmapping with npot textures
        // https://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
        //this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.textures[name] = new Texture(glTexture,[image.width,image.height]);
        
    }

    setScene(scene:Scene){
        this.scene = scene;
    }

    render(){
        // Compute camera matrix only once
        const projectionViewMatrix:mat4 = this.camera.getViewProjectionMatrix();

        // Context initialization
        this.gl.clearColor(0,0,0,1);
        this.gl.clearDepth(1)
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
        
        for(const matName in this.renderQueue){
            const material = this.materials[matName];
            const geomQueue = this.renderQueue[matName];

            material.render(this.gl,projectionViewMatrix,geomQueue);
        }
    }
}