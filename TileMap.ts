import * as pc from 'playcanvas';
import { Tile } from './Tile';

export class TileMap {
    private tiles: { [key: string]: Tile } = {};
    private center: pc.Vec3;

    constructor(app: pc.Application) {
        this.initialize(app).then(() => {
            console.log("TileMap initialized with tiles.");
        }).catch(err => {
            console.error("Failed to initialize TileMap:", err);
        });
    }

    async initialize(app: pc.Application) {
        const colorResponse = await fetch('./colors.json');
        const positionResponse = await fetch('./positions.json');
        const colorsJson = await colorResponse.json();
        const positionsJson = await positionResponse.json();

        const initColors: { [key: string]: pc.Color } = {};
        Object.keys(colorsJson).forEach(key => {
            const [r, g, b] = colorsJson[key];
            initColors[key] = new pc.Color(r, g, b);
        });
        Object.keys(positionsJson).forEach(key => {
            const [x, z] = positionsJson[key];
            const posVec = new pc.Vec3(x, -0.5, z);
            // this.registerTile(key, new Tile(key, this, app, posVec, initColors[key]));
            new Tile(key, this, app, posVec, initColors[key]);
        });
    }

    registerTile(key: string, tile: Tile): void {
        if (this.tiles[key]) {
            this.tiles[key].remove();  // Ensure no duplicates
        }
        this.tiles[key] = tile;
    }

    deregisterTile(key: string): void {
        delete this.tiles[key];
    }

    updateKey(oldKey: string, newKey: string): void {
        if (this.tiles[oldKey]) {
            const tile = this.tiles[oldKey];
            delete this.tiles[oldKey];
            this.tiles[newKey] = tile;
        }
    }

    getTile(key: string): Tile {
        return this.tiles[key];
    }

    getTiles(): { [key: string]: Tile } | undefined {
        return this.tiles;
    }
}
