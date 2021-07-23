interface MapConfig{
    tileSize:number;
    width:number;
    height:number;
}

class Tile{
    static FLIP_V:number = 0;
    static FLIP_H:number = 1;
    opacity:number;
    texture:number;
    rotation:number;
    flip:number;
}
class Layer{
    tiles:Tile[];
    constructor(private width:number,private height:number){
        this.tiles = new Tile[this.width * this.height];
    }

    setTile(tile:Tile,x:number,y:number){
        this.tiles[y * this.width + x] = tile;
    }
    getTile(x:number,y:number):Tile{
        return this.tiles[y * this.width + x];
    }
}
class TileMap{
    private layers:Layer[];

    constructor(config:MapConfig){
        
    }

    addLayer(layer:Layer):void{
        this.layers.push(layer);
    }

    getTiles(x:number,y:number):Tile[]{
        const tiles = Tile[this.layers.length];
        for(let layer of this.layers){
            tiles.push(layer.getTile(x,y));
        }

        return tiles;
    }
}

export {
    Layer,
    Tile,
    TileMap,
    MapConfig
}