import * as pc from 'playcanvas';
import { TileMap } from './TileMap';

export interface TileInterface {
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
        private dictionaryRef: TileMap,
        private app: pc.Application,
        position: pc.Vec3,
        color: pc.Color
    ) {
        this.key = key;
        this.color = color;
        this.entity = new pc.Entity();
        this.entity.addComponent('model', { type: 'box' });
        this.entity.setLocalScale(new pc.Vec3(10, 0.1, 10));
        this.entity.setPosition(position);
        this.setupMaterial(color);
        this.dictionaryRef.registerTile(key, this);
        this.app.root.addChild(this.entity);
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

    private setupMaterial(color: pc.Color): void {
        const material = new pc.StandardMaterial();
        material.diffuse = color;
        material.update();
        this.entity.model.meshInstances[0].material = material;
    }
}
