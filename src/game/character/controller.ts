import * as pc from 'playcanvas';
import { Character } from './character';
import { Engine } from '../../core/engine';
import { MovementConfig } from '../../core/config';
import { TileManager } from '../tiles/tileManager';
import { Direction, DirectionEnum } from '../utility';

export class Controller {
    private app: pc.Application;
    private camera: pc.Entity;
    private character: Character;
    private movement: MovementConfig;
    private tileManager: TileManager;
    private angle = 0;
    private walkPressed = false;
    // 🧭 Make the model face backward (180° turn)
    private hasRotated = false;

    constructor(
        engine: Engine, 
        character: Character, 
        movementConfig: MovementConfig, 
        tileManager: TileManager
    ) {
        this.app = engine.app;
        this.camera = engine.camera;
        this.character = character;
        this.movement = movementConfig;
        this.tileManager = tileManager;

        this.setupControls();
        this.app.on('update', this.update.bind(this));
    }

    private setupControls(): void {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowDown') {
                this.walkPressed = true;
                this.character.interruptSpecialAnimation();
                this.character.play('walk');
            }
            if (e.code === 'Space') {
                this.character.transitionToYessiree(this.walkPressed);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.walkPressed = false;
                if (!this.character.isSpecialPlaying()) {
                    this.character.play('idle');
                }
            }
        });
    }

    private update(dt: number): void {
        // Ensure tiles is initialized before using it
        if (!this.tileManager.getTiles() || !this.tileManager.getTile('cc')) {
            console.warn('Tiles objects are not yet initialized.');
            return;
        }

        // ⬇️ Rotate model once, after initialization
        if (!this.hasRotated) {
            // this.character.rotate(new pc.Vec3(0, 180, 0));
            this.hasRotated = true;
        }

        // Character movement
        this.handleMovement(dt);
        this.handleRotation(dt);
        this.handleZoom(dt);
        this.updateCameraPosition();
        if (__DEBUG__)this.printPositions(); // for debug purpose only!

        this.checkTileBoundary();
    }

    // Translate character and camera
    private handleMovement(dt: number): void {
        const keyboard = this.app.keyboard;
        const moveSpeed = this.movement.speed * dt;
        const move = new pc.Vec3();

        if (keyboard.isPressed(pc.KEY_W)) move.z += moveSpeed;
        if (keyboard.isPressed(pc.KEY_S)) move.z -= moveSpeed;
        if (keyboard.isPressed(pc.KEY_A)) move.x += moveSpeed;
        if (keyboard.isPressed(pc.KEY_D)) move.x -= moveSpeed;

        this.character.translateLocal(move);

        // Preserve the camera's y-position: If the camera is tilted or rotated, 
        // translating along the local z-axis (for forward/backward movement) might 
        // also slightly move the camera up or down, depending on its orientation, which 
        // could inadvertently affect the y-position if the camera's orientation is not 
        // perfectly aligned with the world axes.
        
        const cameraY = this.camera.getPosition().y;

        const reverse = new pc.Vec3(0, 0, -1);
        const camera_move = new pc.Vec3();

        camera_move.mul2(move, reverse);

        this.camera.translateLocal(camera_move);
        this.camera.setPosition(this.camera.getPosition().x, cameraY, this.camera.getPosition().z);
    }

    // Rotate character
    private handleRotation(dt: number): void {
        const keyboard = this.app.keyboard;
        const rotateSpeed = this.movement.rotateSpeed * dt;
        let rotation = 0;

        if (keyboard.isPressed(pc.KEY_LEFT)) rotation += rotateSpeed;
        if (keyboard.isPressed(pc.KEY_RIGHT)) rotation -= rotateSpeed;

        if (rotation !== 0) {
            this.character.rotate(new pc.Vec3(0, rotation, 0));
            this.angle += pc.math.DEG_TO_RAD * rotation;
        }
    }

    // Camera zoom
    private handleZoom(dt: number): void {
        const keyboard = this.app.keyboard;
        const zoomSpeed = this.movement.zoomSpeed * dt;

        if (keyboard.isPressed(pc.KEY_UP)) this.camera.translateLocal(0, 0, -zoomSpeed);
        if (keyboard.isPressed(pc.KEY_DOWN)) this.camera.translateLocal(0, 0, zoomSpeed);
    }

    // Rotate camera
    private updateCameraPosition(): void {
        const characterPos = this.character.getPosition();
        const cameraPos = this.camera.getPosition();
        // Calculate the distance on the x-z plane
        const dx = cameraPos.x - characterPos.x;
        const dz = cameraPos.z - characterPos.z;
        // Dynamic radius based on the current camera position and the box's position
        const radius = Math.sqrt(dx * dx + dz * dz);
        const x = Math.sin(this.angle) * radius;
        const z = Math.cos(this.angle) * radius;
        const cameraHeight = this.camera.getPosition().y;
        // Calculate the new camera position to stay behind the box
        this.camera.setPosition(characterPos.x - x, cameraHeight, characterPos.z - z);
        this.camera.lookAt(characterPos);
    }

    private printPositions(): void { // for debug purpose only!
        const keyboard = this.app.keyboard;
        if (keyboard.isPressed(pc.KEY_SPACE)) {
            console.log(this.character.getPosition());
            console.log(this.camera.getPosition());
        }
    }

    private checkTileBoundary(): void {
        const boxPos = this.character.getPosition();
        const ccTile = this.tileManager.getTile('cc')!;
        // centerPos is the cc tile's center position
        const centerPos = ccTile.getEntity().getPosition();
        const tileCoord = ccTile.getMetadata().tile_coord;

        // here to use const tileCoord.minLon is a good approx. to take into account tiles are not "squared"
        const latSize = this.tileManager.measure(tileCoord.minLat, tileCoord.minLon, tileCoord.maxLat, tileCoord.minLon);
        // here to use const tileCoord.minLat is a good approx. to take into account tiles are not "squared"
        const lonSize = this.tileManager.measure(tileCoord.minLat, tileCoord.minLon, tileCoord.minLat, tileCoord.maxLon);

        const latHalfWidth = latSize / 2;
        const lonHalfWidth = lonSize / 2;

        // Determine boundary crossing
        if (Math.abs(boxPos.x - centerPos.x) > lonHalfWidth || Math.abs(boxPos.z - centerPos.z) > latHalfWidth) {
            const exitDir: DirectionEnum =
                boxPos.x - centerPos.x > lonHalfWidth
                    ? DirectionEnum.E
                    : boxPos.x - centerPos.x < -lonHalfWidth
                    ? DirectionEnum.W
                    : boxPos.z - centerPos.z > latHalfWidth
                    ? DirectionEnum.S
                    : DirectionEnum.N;

            // Update all the panels for the next frame
            const direction = new Direction(exitDir);

            this.tileManager.updateTilesOnBoundaryCross(direction);
        }
    }
}
