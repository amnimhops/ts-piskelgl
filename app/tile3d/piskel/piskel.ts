import { Geometry, quad } from "tile3d/webgl/geometry";
import { Texture } from "tile3d/webgl/material";
import { WebGLManager } from "tile3d/webgl/webglmanager";
interface PiskelChunk{
    layout:number[][];
    base64PNG:string;
}
interface PiskelLayer{
    name:string;
    opacity:number;
    frameCount:number;
    chunks:PiskelChunk[];
}
interface Piskel{
    modelVersion:string;
    piskel:{
        description:string;
        fps:number;
        height:number;
        width:number;
        layers:PiskelLayer[];
    }
}
class PiskelLoader{
    static load(data:string):Piskel{
        return PiskelLoader.parseFile(data);
    }

    static fubar(data:string):void{
        const piskel:Piskel = PiskelLoader.load(data);

        //piskel.
    }

    private static parseLayer(data:string):PiskelLayer{
        const jsonData = JSON.parse(data);

        const layer:PiskelLayer = {
            chunks:[],
            frameCount:jsonData['frameCount'],
            name:jsonData['name'],
            opacity:jsonData['opacity']
        };

        layer.chunks.push(jsonData['chunks'].map( (chunk:any) => chunk as PiskelChunk ));

        return layer;
    }

    private static parseFile(jsonData:any):Piskel{

        const file:Piskel = {
            modelVersion : jsonData['modelVersion'],
            piskel:{
                description : jsonData['description'],
                fps : jsonData['fps'],
                height : jsonData['height'],
                width : jsonData['width'],
                layers : []
            }
        };
    
        // we will have to rebuild jsonData.layers since layer data is stored as a stringyfied object
        file.piskel.layers.push(jsonData.piskel.layers.map( PiskelLoader.parseLayer ));
        
        
        return file;
    }
}

class PiskelSurface{
   
}

class PiskelMaterial{

}

export{
    PiskelLoader,
    Piskel as PiskelFileFormat,PiskelLayer as PiskelFileFormatLayer,PiskelChunk as PiskelFileFormatLayerChunk
}