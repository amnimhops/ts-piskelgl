import { vec2 } from "gl-matrix";

class Texture{
    glTex:WebGLTexture;
    size:vec2;

    constructor(glTex:WebGLTexture,size:vec2){
        this.glTex = glTex;
        this.size = size;        
    }
}

type TextureMap = Record<string, Texture>;

class TextureManager {
    private static gl: WebGLRenderingContext;
    private static textures: TextureMap = {};
    static init(context: WebGLRenderingContext) {
        TextureManager.gl = context;
    }

    static getTexture(name: string): Texture {
        if (TextureManager.textures[name] == undefined) {
            throw new Error(`Texture ${name} not found`);
        }

        return this.textures[name];
    }

    static createTexture(name: string, image: HTMLImageElement) {
        const gl = TextureManager.gl;

        if (TextureManager.textures[name] != undefined) {
            throw new Error(`texture ${name} already defined`);
        }

        const glTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // TODO: Need to check if webgl does support mipmapping with npot textures
        // https://stackoverflow.com/questions/3792027/webgl-and-the-power-of-two-image-size
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
        //gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        TextureManager.textures[name] = new Texture(glTexture, [image.width, image.height]);

    }
}

export{
    TextureManager,
    Texture
}