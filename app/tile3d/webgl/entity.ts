import { mat4, vec3 } from "gl-matrix";

function defaultUpdateHandler(){

}

class Entity{
    private translation:mat4;
    private rotation:mat4;
    private scalation:mat4;
    protected onUpdate:()=>void = defaultUpdateHandler;

    constructor(translation:mat4 = undefined, rotation = undefined, scalation = undefined){
        this.translation = translation || mat4.create();
        this.rotation = rotation || mat4.create();
        this.scalation = scalation || mat4.create();
    }

    public cloneFromEntity(entity:Entity){
        this.translation = mat4.clone(entity.translation);
        this.rotation = mat4.clone(entity.rotation);
        this.scalation = mat4.clone(entity.scalation);
    }

    rotate(angle:number,axis:vec3){
        mat4.rotate(this.rotation,this.rotation,angle * Math.PI / 180, axis);
        this.onUpdate();
    }

    translate(position:vec3){
        mat4.translate(this.translation,this.translation,position);
        this.onUpdate();
    }

    scale(amount:vec3){
        mat4.scale(this.scalation,this.scalation,amount);
        this.onUpdate();
    }

    get matrix():mat4{
        const mtx = mat4.create();
        mat4.multiply(mtx,this.scalation,this.rotation);
        mat4.multiply(mtx,mtx,this.translation);

        return mtx;
    }

    getPosition():vec3{
        const pos = vec3.create();
        mat4.getTranslation(pos,this.translation);
        return pos;
    }
}

export {
    Entity
}