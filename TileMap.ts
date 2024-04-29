import { TileInterface } from './Tile';

export class TileMap {
    private tiles: { [key: string]: TileInterface } = {};

    registerTile(key: string, tile: TileInterface): void {
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

    getTile(key: string): TileInterface {
        return this.tiles[key];
    }

    getTiles(): { [key: string]: TileInterface } | undefined {
        return this.tiles;
    }
}
