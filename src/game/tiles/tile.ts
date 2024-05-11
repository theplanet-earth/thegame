import * as pc from 'playcanvas';
import { TileManager } from './tileManager';

export interface TileInterface {
    initializeTile: (lat: number, lng: number) => Promise<void>;
    fetchGLB: (url: string) => Promise<Blob>;
    loadGLBFromBlob: (blob: Blob, onLoad: (container: pc.Entity) => void) => void;
    getTileFilename: (lat: number, lng: number) => string;
    getEntity: () => pc.Entity;
    getColor: () => pc.Color;
    updateKey: (newKey: string) => void;
    updatePosition: (newPosition: pc.Vec3) => void;
    updateColor: (newColor: pc.Color) => void;
    remove: () => void;
}

export class Tile implements TileInterface {
    private entity: pc.Entity;
    private color: pc.Color;
    private key: string;

    constructor(
        key: string,
        private dictionaryRef: TileManager,
        private app: pc.Application,
        lat: number, 
        lng: number,
        position: pc.Vec3,
        color: pc.Color
    ) {
        this.key = key;
        this.color = color;
        this.dictionaryRef.registerTile(key, this);

        // Initialize the tile and then set up the entity
        this.initializeTile(lat, lng).then(() => {
            this.entity.setPosition(position);
            this.setupMaterial(color);
            this.app.root.addChild(this.entity);
            console.debug("Tile correctly initialized.");
        }).catch(err => {
            console.error("Failed to initialize Tile:", err);
        });
    }

    // Initialization using dynamic coordinates
    async initializeTile(lat: number, lng: number): Promise<void> {
        try {
            const filename = this.getTileFilename(lat, lng);
            console.debug('Coordinates received:', filename);

            const blob = await this.fetchGLB(`https://nestjs-deal.vercel.app/buildings/filename/${filename}.glb`);
            this.entity = await this.loadGLBFromBlob(blob);
        } catch (error) {
            console.error('Failed to load Tile:', error);
        }
    }

    // Initialization and application setup here
    async fetchGLB(url: string): Promise<Blob> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    }

    // loadGLBFromBlob(blob: Blob, onLoad: (container: pc.Entity) => void ) {
    async loadGLBFromBlob(blob: Blob): Promise<pc.Entity> {
        const url = URL.createObjectURL(blob);
        const asset = new pc.Asset('tileModel', 'container', { url: url });
        this.app.assets.add(asset);
        this.app.assets.load(asset);

        return new Promise((resolve, reject) => {
            asset.on('load', () => {
                const container = asset.resource.instantiateRenderEntity();
                // onLoad(container);
                resolve(container);
            });
            asset.on('error', (err, asset) => {
                console.error('Error loading asset:', err);
                reject(err);
            });
        });
}

    // Helper function to format the filename
    getTileFilename(lat: number, lng: number): string {
        var gridInterval = 0.005; // degrees, adjust size of grid cells
        const minLat = Math.floor((lat - 41.8240) / gridInterval) * gridInterval + 41.8240;
        const minLng = Math.floor((lng - 12.4435) / gridInterval) * gridInterval + 12.4435;
        const maxLat = minLat + gridInterval;
        const maxLng = minLng + gridInterval;

        // Convert to a string with no decimal points
        const minLatStr = (minLat * 10000).toFixed(0);
        const minLngStr = (minLng * 10000).toFixed(0);
        const maxLatStr = (maxLat * 10000).toFixed(0);
        const maxLngStr = (maxLng * 10000).toFixed(0);

        return `${minLatStr}${minLngStr}${maxLatStr}${maxLngStr}`;
    }

    getEntity(): pc.Entity {
        return this.entity;
    }

    getColor(): pc.Color {
        return this.color;
    }

    updateKey(newKey: string): void {
        this.dictionaryRef.updateKey(this.key, newKey);
        this.key = newKey;
    }

    updatePosition(newPosition: pc.Vec3): void {
        this.entity.setPosition(newPosition);
    }

    updateColor(newColor: pc.Color): void {
        this.color = newColor;
        this.setupMaterial(newColor);
    }

    remove(): void {
        this.app.root.removeChild(this.entity);
        this.dictionaryRef.deregisterTile(this.key);
    }

    // tmp : setting up the color for DEBUG only
    private setupMaterial(color: pc.Color): void {
        const material = new pc.StandardMaterial();
        material.diffuse = color;
        material.update();
        if (this.entity.model) { // Ensure the entity has a model component               
            // this.entity.model.meshInstances.forEach(meshInstance => {
            //     meshInstance.material = material;
            // });
            this.entity.model.meshInstances[0].material = material;
        } else if (this.entity.children) {
            this.entity.children.forEach(child => {
                child.render.meshInstances.forEach(meshInstance => {
                    meshInstance.material = material;
                });
            });
        } else {
            console.error('Loaded entity does not have a model nor children components.');
        }    
    }
}
