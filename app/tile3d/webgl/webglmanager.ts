
import { mat4, vec3, vec4 } from 'gl-matrix';
import { ColorMaterial, Material, MaterialParams, Texture, TextureMaterial } from "./material";
import { Geometry } from "./geometry";
import { Scene } from './scene';
import { Entity } from './entity';
import { Camera } from './camera';
import { TextureManager } from './texture';

export class WebGLManager {
    geometryCount:number = 0;
    gl: WebGLRenderingContext;

    scene: Scene;
    materials: Record<string, Material> = {};
    geometries: Geometry[] = [];
    renderQueue: Record<string, Geometry[]> = {};
    camera: Camera;
    background:vec4 = [0.1,0.1,0.1,1];

    constructor(context: WebGLRenderingContext) {
        this.gl = context;
        TextureManager.init(context);
    }

    addMaterial(name: string, material: Material) {
        if (this.materials[name] !== undefined) {
            throw new Error(`Material ${name} already added`);
        }

        this.materials[name] = material;
        this.renderQueue[name] = [];
    }

    addAnonGeometry(geometry: Geometry, pname: string) {
        this.addGeometry("anonymous_geometry#"+this.geometryCount,geometry,pname);
    }

    addGeometry(name: string, geometry: Geometry, pname: string) {
        if (this.geometries[name] !== undefined) {
            throw new Error(`Geometry ${name} already added`);
        }
        if (this.materials[pname] == undefined) {
            throw new Error(`Program ${pname} not defined`);
        }

        this.geometries[name] = geometry;
        this.renderQueue[pname].push(geometry);

        geometry.build(this.gl);

        this.geometryCount++;
    }

    setCamera(camera: Camera) {
        this.camera = camera;
    }

    setScene(scene: Scene) {
        this.scene = scene;
    }

    private sortGeometriesByCamPos(geometries: Geometry[], reverse: boolean = false): Geometry[] {
        const camPos = this.camera.getPosition();
        const sortedGeometries = new Array(...geometries);
        sortedGeometries.sort((a: Geometry, b: Geometry): number => {
            const aDist = vec3.dist(camPos, a.getPosition());
            const bDist = vec3.dist(camPos, b.getPosition());
            return reverse ? (bDist - aDist) : (aDist - bDist);
        });

        return sortedGeometries;
    }

    render() {
        // Compute camera matrix only once
        const projectionViewMatrix: mat4 = this.camera.getViewProjectionMatrix();

        // Context initialization
        this.gl.clearColor(this.background[0],this.background[1],this.background[2],this.background[3]);
        this.gl.clearDepth(1)
        // Temporarily disabled to draw overlapped transparent textures
        //this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);

        for (const matName in this.renderQueue) {
            const material = this.materials[matName];
            const geomQueue = this.sortGeometriesByCamPos(this.renderQueue[matName], false);

            material.render(this.gl, projectionViewMatrix, geomQueue);
        }
    }
}