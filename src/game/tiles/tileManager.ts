import * as pc from 'playcanvas';
import { Tile } from './tile';

export class TileManager {
    private tiles: { [key: string]: Tile } = {};
    private center: pc.Vec3;

    constructor(app: pc.Application, centerLat: number, centerLng: number) {
        this.initialize(app, centerLat, centerLng).then(() => {
            console.info("TileMap initialized with tiles.");
        }).catch(err => {
            console.error("Failed to initialize TileMap:", err);
        });
    }

    // Function to initialize all surrounding tiles including the center
    async initialize(app: pc.Application, centerLat: number, centerLng: number) {
        const colorResponse = await fetch('/assets/colors.json');
        const colorsJson = await colorResponse.json();

        const initColors: { [key: string]: pc.Color } = {};
        Object.keys(colorsJson).forEach(key => {
            const [r, g, b] = colorsJson[key];
            initColors[key] = new pc.Color(r, g, b);
        });

        // Initialize the "cc" key tile first
        const tileUrl = `https://nestjs-deal.vercel.app/tiles/search?lat=${centerLat}&lon=${centerLng}`;
        const tileResponse = await fetch(tileUrl);
        const tileJson = await tileResponse.json();

        let ccMetadata;
        let ccCoordinates;

        if (tileJson && tileJson.length > 0) {
            ccMetadata = tileJson[0];
            ccCoordinates = this.centerCoordinates(ccMetadata.tile_coord);

            new Tile('cc', this, app, pc.Vec3.ZERO, ccMetadata, initColors['cc']);
        }
        // Initialize all other tiles
        for (const key of Object.keys(colorsJson)) {
            if (key !== 'cc') {
                // Make HTTP POST request for each tile
                const tileUrl = `https://nestjs-deal.vercel.app/tiles/search/${key}`;
                const tileResponse = await fetch(tileUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ccMetadata)
                });
                // Log the status of the response
                console.debug(`Response status: ${tileResponse.status}`);
                // Check if the response is OK
                if (!tileResponse.ok) {
                    throw new Error(`HTTP error! status: ${tileResponse.status}`);
                }
                const tileJson = await tileResponse.json();

                if (tileJson && tileJson.length > 0) {
                    const tileMetadata = tileJson[0];
                    // const { minLat, minLon, maxLat, maxLon } = tileMetadata.tile_coord;
                    const tileCoordinates = this.centerCoordinates(tileMetadata.tile_coord);
                    const posVec = this.relativePosition(tileCoordinates.lat, tileCoordinates.lon, ccCoordinates.lat, ccCoordinates.lon).add(this.getTile("cc").getPosition());
                    new Tile(key, this, app, posVec, tileMetadata, initColors[key]);
                }
            }
        }
    }

    centerCoordinates(coords: { minLat: number, minLon: number, maxLat: number, maxLon: number }): { lat: number, lon: number } {
        const centerLat = (coords.minLat + coords.maxLat) / 2;
        const centerLon = (coords.minLon + coords.maxLon) / 2;
        return { lat: centerLat, lon: centerLon };
    }

    // Calculate distance based on Haversine formula
    measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    }

    // Calculate relative position to place each model
    relativePosition(lat: number, lng: number, centerLat: number, centerLng: number): pc.Vec3 {
        const distanceLat = this.measure(centerLat, centerLng, lat, centerLng);
        const distanceLng = this.measure(centerLat, centerLng, centerLat, lng);

        // Determine direction to place tiles correctly in relation to the center
        const dirLat = lat > centerLat ? -1 : 1; //odd pc z direction (downward)
        const dirLng = lng > centerLng ? 1 : -1;

        return new pc.Vec3(distanceLng * dirLng, 0, distanceLat * dirLat);
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
