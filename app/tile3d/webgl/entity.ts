import { mat4, vec3 } from "gl-matrix";

class Entity{
    private translation:mat4;
    private rotation:mat4;
    private scalation:mat4;

    constructor(translation:mat4 = undefined, rotation = undefined, scalation = undefined){
        this.translation = translation || mat4.create();
        this.rotation = rotation || mat4.create();
        this.scalation = scalation || mat4.create();
    }

    rotate(angle:number,axis:vec3){
        mat4.rotate(this.rotation,this.rotation,angle * Math.PI / 180, axis);
    }

    translate(position:vec3){
        mat4.translate(this.translation,this.translation,position);
    }

    scale(amount:vec3){
        mat4.scale(this.scalation,this.scalation,amount);
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