import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { Geometry } from "./geometry";
import { Texture } from "./texture";

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

interface MaterialParams{
    gl:WebGLRenderingContext;
    projectionMatrix:mat4;
    modelViewMatrix:mat4;
}

class Material{
    static VERTEX_ATTRIBUTES = 3+2; // x y z u v
    static VERTEX_ATTRIBUTE_SIZE = Float32Array.BYTES_PER_ELEMENT;
    static VERTEX_SIZE = Material.VERTEX_ATTRIBUTE_SIZE * Material.VERTEX_ATTRIBUTES;
    
    private glProgram:WebGLProgram;
    private compiled:boolean = false;

    constructor(private vsSource:string, private fsSource:string){
        
    }
    protected getProgram():WebGLProgram{
        return this.glProgram;
    }
    private compile(gl:WebGLRenderingContext){
        this.glProgram = initShaders(gl,this.vsSource,this.fsSource);
        // Avoid compile again
        this.compiled = true;
    }
    protected beforeDraw(gl:WebGLRenderingContext){

    }
    /**
     * 
     * @param gl 
     * @param projectionMatrix 
     * @param modelViewMatrix 
     * @param samplerTextureId 0 for GL_TEXTURE0 and so on
     */
    render(gl:WebGLRenderingContext, projectionMatrix:mat4, geometries:Geometry[]){

        if(!this.compiled){
            this.compile(gl);
        }
        // Note to myself: useProgram must be invoked before uniform setup
        gl.useProgram(this.glProgram); 
        
        const camUniform = gl.getUniformLocation(this.glProgram,"uProjectionMatrix");
        const modelViewUniform = gl.getUniformLocation(this.glProgram,"uModelViewMatrix");
        
        for(const geometry of geometries){
            if(geometry.visible){
                gl.uniformMatrix4fv(camUniform,false,projectionMatrix);

                this.beforeDraw(gl);

                // Vertex data is located in the first 3 floats of the vertex buffer
                const vertexAttrib = gl.getAttribLocation(this.glProgram,"aVertexPosition");
                gl.vertexAttribPointer(vertexAttrib,3,gl.FLOAT,false,Material.VERTEX_SIZE,0);  // first 3 floats
                gl.enableVertexAttribArray(vertexAttrib);
                        
                gl.bindBuffer(gl.ARRAY_BUFFER,geometry.vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geometry.indexBuffer);
            
                gl.uniformMatrix4fv(modelViewUniform,false,geometry.matrix);
                gl.drawElements(gl.TRIANGLES,3 * geometry.faceCount ,gl.UNSIGNED_SHORT,0);
            }
        }
    }
}

class ColorMaterial extends Material{
    static VS_SRC = `
        attribute vec4 aVertexPosition;
                
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
        `;
    static FS_SSRC = `
        uniform highp vec4 matColor;

        void main() {
            gl_FragColor = matColor;

        }
    `;

    private color:vec4;

    constructor(color:vec4){
        super(ColorMaterial.VS_SRC,ColorMaterial.FS_SSRC);
        
        this.color = color;
    }

    beforeDraw(gl:WebGLRenderingContext){
        // Add uniform for material rgb color
        const matColorUniform = gl.getUniformLocation(this.getProgram(),"matColor");
        gl.uniform4fv(matColorUniform,this.color);
    }

    
}

class TextureMaterial extends Material{
    static VS_SRC = `
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
    static FS_SSRC = `
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main() {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    `;
    
    constructor(private texture:Texture){
        super(TextureMaterial.VS_SRC,TextureMaterial.FS_SSRC);
    }

    beforeDraw(gl:WebGLRenderingContext){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture.glTex);

        const textCoordAttrib = gl.getAttribLocation(this.getProgram(),"aTextureCoord");
        gl.vertexAttribPointer(textCoordAttrib,2,gl.FLOAT,false,Material.VERTEX_SIZE,3 * Material.VERTEX_ATTRIBUTE_SIZE);   // skip 3 floats, next 2 floats
        gl.enableVertexAttribArray(textCoordAttrib);

        const samplerUniform = gl.getUniformLocation(this.getProgram(),"uSampler");
        gl.uniform1i(samplerUniform,0); // Texture #0, the single texture
    }


}

class AnimatedTextureMaterial extends Material{
    static VS_SRC = `
        attribute vec4 aVertexPosition;
        
        // TIP: If an attribute is not used, glAttribGetLocation returns -1 and a warning is shown on console

        attribute float aFrameIndex; // Vertex frame index
        uniform vec2 uAtlasSize; // Atlas width and height
        uniform vec2 uFrameSize; // Frame width and height
        uniform float uFrameIndexOffset; // Frame offset for animation
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        attribute vec2 aTextureCoord;
        varying highp vec2 vTextureCoord;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            highp float u = uAtlasSize.x / uFrameSize.x;
            highp float v = uAtlasSize.y / uFrameSize.y;
            float f_index = aFrameIndex + uFrameIndexOffset;
            // frame pos (0,0) on atlas
            vec2 fu = vec2(mod(f_index,u) / u,floor(f_index/v)/v);

            vTextureCoord = fu + vec2(aTextureCoord.x/u,aTextureCoord.y/v);
            //vTextureCoord = ;
        }
        `;
    static FS_SSRC = `
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main() {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    `;
    
    frameIndex:number = 0;

    constructor(private texture:Texture,private frameSize:vec2,private numFrames:number){
        super(AnimatedTextureMaterial.VS_SRC,AnimatedTextureMaterial.FS_SSRC);
    }

    beforeDraw(gl:WebGLRenderingContext){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture.glTex);
        /*
         * setup texture coords attribute
         */
        const textCoordAttrib = gl.getAttribLocation(this.getProgram(),"aTextureCoord");
        gl.vertexAttribPointer(textCoordAttrib,2,gl.FLOAT,false,Material.VERTEX_SIZE,3 * Material.VERTEX_ATTRIBUTE_SIZE);   // skip 3 floats, next 2 floats
        gl.enableVertexAttribArray(textCoordAttrib);

        /*
         * setup frame index attribute and atlas/frame uniforms
         */
        const frameIndexAttrib = gl.getAttribLocation(this.getProgram(),"aFrameIndex");
        // Notice we are using here GL.FLOAT even though frame index seems to be an integer (in fact, it is).
        // This is because the entire buffer is a float32array.
        gl.vertexAttribPointer(frameIndexAttrib,1,gl.FLOAT,false,Material.VERTEX_SIZE,5 * Material.VERTEX_ATTRIBUTE_SIZE); // Skip 5 floats, next 1 float
        gl.enableVertexAttribArray(frameIndexAttrib);

        const atlasSizeUniform = gl.getUniformLocation(this.getProgram(),"uAtlasSize");
        const frameSizeUniform = gl.getUniformLocation(this.getProgram(),"uFrameSize");
        const textureFrameIndexOffset = gl.getUniformLocation(this.getProgram(),"uFrameIndexOffset");
        gl.uniform2fv(atlasSizeUniform,this.texture.size);
        gl.uniform2fv(frameSizeUniform,this.frameSize);
        gl.uniform1f(textureFrameIndexOffset,this.frameIndex);
        //const atlasWidth = gl.getTexParameter(gl.TEXTURE_2D,gl.WIODTH)
        //gl.uniform2fv(atlasSizeUniform)
        /*
         * Setup sampler uniform
         */
        const samplerUniform = gl.getUniformLocation(this.getProgram(),"uSampler");
        gl.uniform1i(samplerUniform,0); // Texture #0, the single texture

        // Increase frame counter
        //this.frameIndex = (this.frameIndex+1) % this.numFrames
        
        //if(this.frameIndex%1000 == 0) console.log(this.frameIndex)

    }


}

export{
    Texture,
    Material,MaterialParams,
    ColorMaterial,
    TextureMaterial,
    AnimatedTextureMaterial
}