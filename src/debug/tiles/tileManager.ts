import * as pc from 'playcanvas';
import { Tile } from './tile';
import { Direction, DirectionEnum } from '../../game/utility';

export class TileMap {
    private tiles: { [key: string]: Tile } = {};
    private app: pc.Application;

    constructor(app: pc.Application) {
        this.app = app;
        this.initialize(app).then(() => {
            console.debug("TileMap initialized with tiles.");
        }).catch(err => {
            console.error("Failed to initialize TileMap:", err);
        });
    }

    async initialize(app: pc.Application) {
        const colorResponse = await fetch('/assets/colors.json');
        const positionResponse = await fetch('/assets/positions.json');
        const colorsJson = await colorResponse.json();
        const positionsJson = await positionResponse.json();

        const initColors: { [key: string]: pc.Color } = {};
        Object.keys(colorsJson).forEach(key => {
            const [r, g, b] = colorsJson[key];
            initColors[key] = new pc.Color(r, g, b);
        });
        Object.keys(positionsJson).forEach(key => {
            const [x, z] = positionsJson[key];
            const posVec = new pc.Vec3(x, +0.1, z);
            // this.registerTile(key, new Tile(key, this, app, posVec, initColors[key]));
            new Tile(key, this, app, posVec, initColors[key]);
        });
    }

    async updateTilesOnBoundaryCross(direction: Direction): Promise<void> {
        // The following order is fundamental, do not mess it up
        let tmpColor: pc.Color = this.getTile(direction.getOpposite().repeat(2)).getColor();
        this.getTile(direction.getOpposite().repeat(2)).remove();
        this.getTile("cc").updateKey(direction.getOpposite().repeat(2));
        // Update the center panel for the next frame
        this.getTile(`${direction.getCurrent()}`.repeat(2)).updateKey("cc");
        
        new Tile(`${direction.getCurrent()}`.repeat(2), this, this.app, this.getTile("cc").getEntity().getPosition().add(direction.getDelta()), tmpColor);

        for (const other of direction.getTransverse()) {

            let tmpColor = this.getTile(direction.getCorner("back", other)).getColor();
            this.getTile(direction.getCorner("back", other)).remove();
            this.getTile(`${other}`.repeat(2)).updateKey(direction.getCorner("back", other));
            this.getTile(direction.getCorner("front", other)).updateKey(`${other}`.repeat(2));

            new Tile(direction.getCorner("front", other), this, this.app, this.getTile(`${other}`.repeat(2)).getEntity().getPosition().add(direction.getDelta()), tmpColor);
        }
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
