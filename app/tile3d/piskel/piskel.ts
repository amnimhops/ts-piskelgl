import { Entity } from "tile3d/webgl/entity";
import { Geometry, quad } from "tile3d/webgl/geometry";
import { Texture } from "tile3d/webgl/material";
import { loadImage, TextureManager } from "tile3d/webgl/texture";
import { WebGLManager } from "tile3d/webgl/webglmanager";

interface PiskelChunk {
    layout: number[][];
    base64PNG: string;
}

interface PiskelLayer {
    name: string;
    opacity: number;
    frameCount: number;
    chunks: PiskelChunk[];
}

interface Piskel {
    modelVersion: string;
    piskel: {
        description: string;
        fps: number;
        height: number;
        width: number;
        layers: PiskelLayer[];
    }
}

interface OnloadImageDetails {
    index: number;
    layer: PiskelLayer;
}

class PiskelLoader {
    static loadCount: number = 0;
    static load(data: string): Promise<PiskelSurface[]> {
        PiskelLoader.loadCount++;

        const piskel: Piskel = PiskelLoader.parseFile(data);
        const imagePromises: Promise<[OnloadImageDetails, HTMLImageElement]>[] = [];

        // #0 Parse layers
        const [width, height, layers] = [piskel.piskel.width, piskel.piskel.height, piskel.piskel.layers];

        // #1 Read image data and load async
        for (let i = 0; i < layers.length; i++) {

            // Piskel format have an array of chunks per layer, but it seems to use just one chunk per layer (based on observations)
            const layer = layers[i];
            const pngData = layer.chunks[0].base64PNG;


            imagePromises.push(
                loadImage(pngData, {
                    index: i,
                    layer: layer
                })
            );
        }

        return new Promise((resolve: (surfaces: PiskelSurface[]) => void, reject: (cause: any) => void) => {
            Promise.all(imagePromises)
                .then((imageTuples: [OnloadImageDetails, HTMLImageElement][]) => {
                    const surfaces: PiskelSurface[] = [];

                    for (const imgTuple of imageTuples) {
                        const [info, image] = imgTuple;
                        const layer = info.layer;
                        const textureId = PiskelLoader.loadCount + "_" + info.index + "_" + layer.name;
                        const texture: Texture = TextureManager.createTexture(textureId, image);
                        const surface: PiskelSurface = new PiskelSurface(width, height, texture, info.index / imageTuples.length, layer.frameCount, piskel.piskel.fps);

                        surfaces.push(surface);

                        resolve(surfaces);
                    }
                })
                .catch((reason: any) => {
                    reject(reason);
                })
        });
    }

    private static parseLayer(data: string): PiskelLayer {
        const jsonData = JSON.parse(data);

        const layer: PiskelLayer = {
            chunks: [],
            frameCount: jsonData['frameCount'],
            name: jsonData['name'],
            opacity: jsonData['opacity']
        };

        layer.chunks.push(...jsonData['chunks'].map((chunk: any) => chunk as PiskelChunk));

        return layer;
    }

    private static parseFile(jsonData: any): Piskel {

        const file: Piskel = {
            modelVersion: jsonData['modelVersion'],
            piskel: {
                description: jsonData['piskel']['description'],
                fps: jsonData['piskel']['fps'],
                height: jsonData['piskel']['height'],
                width: jsonData['piskel']['width'],
                layers: []
            }
        };

        // we will have to rebuild jsonData.layers since layer data is stored as a stringyfied object
        file.piskel.layers.push(...jsonData.piskel.layers.map(PiskelLoader.parseLayer));

        return file;
    }
}

class PiskelSurface extends Entity {
    texture: Texture;
    geometries: Geometry[];
    width: number;
    height: number;

    frames: number;
    frameIndex: number = 0;
    fps: number;
    millisPerFrame: number;
    lastDelta: number = 0;

    constructor(width: number, height: number, texture: Texture, zIndex: number, frames: number, fps: number) {
        super();

        this.frames = frames;
        this.fps = fps;
        this.millisPerFrame = 1000 / fps;

        this.texture = texture;
        this.width = width;
        this.height = height;

        this.geometries = [];

        const frameUvSize = 1 / frames;

        for (let c = 0; c < frames; c++) {
            const geometry = quad([0, 0, zIndex], 1, [[c * frameUvSize, 0], [c * frameUvSize + frameUvSize, 1]]);
            geometry.visible = false;
            this.geometries.push(geometry);
        }

        this.geometries[0].visible = true;
        // Set this entity update handler to copy changes to all the geometries owned
        /*this.onUpdate = () => {
            for(const geometry of this.geometries){
                geometry.cloneFromEntity(this);
            }
        }*/

        PiskelAnimationManager.add(this);
    }

    update(delta: number) {
        if(delta + this.lastDelta >= this.millisPerFrame){
            this.lastDelta = (delta + this.lastDelta) % this.millisPerFrame;
            this.geometries.forEach( (geometry) => geometry.visible = false);
            this.frameIndex = (this.frameIndex + 1) % this.frames;
            this.geometries[this.frameIndex].visible = true;
        }else{
            this.lastDelta += delta;
        }
    }
}


class PiskelAnimationManager {
    static surfaces: PiskelSurface[] = [];

    static add(surface: PiskelSurface) {
        PiskelAnimationManager.surfaces.push(surface);
    }

    static update(delta: number) {
        for(const surface of PiskelAnimationManager.surfaces){
            surface.update(delta);
        }
    }
}

class PiskelMaterial {

}

export {
    PiskelLoader,
    PiskelAnimationManager,
    /*Piskel as PiskelFileFormat,
    PiskelLayer as PiskelFileFormatLayer,
    PiskelChunk as PiskelFileFormatLayerChunk*/
    PiskelSurface
}