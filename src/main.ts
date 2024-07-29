import * as pc from 'playcanvas';
import { Tile, TileInterface } from './debug/tiles/tile';
import { TileMap } from './debug/tiles/tileManager';
import { Direction, DirectionEnum } from './game/utility';
import { TileManager } from './game/tiles/tileManager';

// Define interfaces for better type-checking
interface Movement {
    speed: number;
    rotateSpeed: number;
    zoomSpeed: number;
}

// Application setup with explicit type assignment
const canvas: HTMLCanvasElement = document.getElementById('application') as HTMLCanvasElement;
const app: pc.Application = new pc.Application(canvas, {
    keyboard: new pc.Keyboard(window)
});

app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

// Declare tiles here so they are accessible later in the 'update' callback
let tileMap: TileManager;
let tiles: TileMap;

app.on('initialize:coordinates', (coordinates) => {
    console.info('Coordinates received:', coordinates);
    // Use these coordinates setting an initial player position
    tileMap = new TileManager(app, coordinates.lat, coordinates.lng);
    tiles = new TileMap(app);
});

app.start();

// After app is fully configured
document.dispatchEvent(new CustomEvent('appReady', { detail: { app } }));

// Lighting setup
const light: pc.Entity = new pc.Entity('light');
light.addComponent('light');
light.setEulerAngles(45, 0, 0);
app.root.addChild(light);

// Box setup
const box: pc.Entity = new pc.Entity('box');
box.addComponent('model', {
    type: 'box'
});
box.setLocalScale(new pc.Vec3(1, 1, 1));
box.setPosition(new pc.Vec3(0, 0.5, 0));
app.root.addChild(box);

// Material setup for box
const boxMaterial: pc.StandardMaterial = new pc.StandardMaterial();
boxMaterial.diffuse = new pc.Color(0.5, 1, 0.5); // Acid Green color
boxMaterial.update();
box.model.meshInstances[0].material = boxMaterial;

// Camera setup
const camera: pc.Entity = new pc.Entity('camera');
camera.addComponent('camera', {
    clearColor: new pc.Color(0.3, 0.3, 0.7)
});
camera.setPosition(new pc.Vec3(0, 5, 10));
camera.lookAt(box.getPosition());
app.root.addChild(camera);

// Movement details
const movement: Movement = {
    speed: 50,
    rotateSpeed: 50,
    zoomSpeed: 20
};

// Variable outside the update function to keep track of the camera angle
let angle: number = 0;

// Update function for box movement and camera follow
app.on('update', (dt: number): void => {
    // Ensure tiles is initialized before using it
    if (!tiles || !tileMap || !tiles.getTiles() || !tiles.getTile("cc")) {
        console.warn("Tiles objects are not yet initialized.");
        return;
    }
    // Box movement
    const camera_height = camera.getPosition().y;
    if (app.keyboard?.isPressed(pc.KEY_W)) {
        box.translateLocal(0, 0, -movement.speed * dt);
        camera.translateLocal(0, 0, -movement.speed * dt);
        camera.setPosition(camera.getPosition().x, camera_height, camera.getPosition().z);
    }
    if (app.keyboard?.isPressed(pc.KEY_S)) {
        box.translateLocal(0, 0, movement.speed * dt);
        camera.translateLocal(0, 0, movement.speed * dt);
        camera.setPosition(camera.getPosition().x, camera_height, camera.getPosition().z);
    }
    if (app.keyboard?.isPressed(pc.KEY_A)) {
        box.translateLocal(-movement.speed * dt, 0, 0);
        camera.translateLocal(-movement.speed * dt, 0, 0);
    }
    if (app.keyboard?.isPressed(pc.KEY_D)) {
        box.translateLocal(movement.speed * dt, 0, 0);
        camera.translateLocal(movement.speed * dt, 0, 0);
    }

    // Rotate box and camera
    if (app.keyboard?.isPressed(pc.KEY_LEFT)) {
        box.rotateLocal(0, movement.rotateSpeed * dt, 0);
        angle += pc.math.DEG_TO_RAD * movement.rotateSpeed * dt;
    }
    if (app.keyboard?.isPressed(pc.KEY_RIGHT)) {
        box.rotateLocal(0, -movement.rotateSpeed * dt, 0);
        angle -= pc.math.DEG_TO_RAD * movement.rotateSpeed * dt;
    }

    // Calculate the new camera position to stay behind the box
    const dx: number = camera.getPosition().x - box.getPosition().x;
    const dz: number = camera.getPosition().z - box.getPosition().z;
    // Calculate dynamic radius based on the current camera position and the box's position
    const radius: number = Math.sqrt(dx * dx + dz * dz);
    const x: number = Math.sin(angle) * radius;
    const z: number = Math.cos(angle) * radius;
    // Set camera position and look at the box
    camera.setPosition(box.getPosition().x + x, camera.getPosition().y, box.getPosition().z + z);
    camera.lookAt(box.getPosition());

    if (app.keyboard?.isPressed(pc.KEY_SPACE)) {
        console.log(camera.getPosition());
    }

    // Camera zoom
    if (app.keyboard?.isPressed(pc.KEY_UP)) {
        camera.translateLocal(0, 0, -movement.zoomSpeed * dt);
    }
    if (app.keyboard?.isPressed(pc.KEY_DOWN)) {
        camera.translateLocal(0, 0, movement.zoomSpeed * dt);
    }
    camera.lookAt(box.getPosition());


    const boxPos = box.getPosition();
    const centerPos = tiles.getTile("cc").getEntity().getPosition();

    // Determine boundary crossing
    if (Math.abs(boxPos.x - centerPos.x) > 5 || Math.abs(boxPos.z - centerPos.z) > 5) {
        const dir: DirectionEnum = 
                    boxPos.x - centerPos.x >  5 ? DirectionEnum.W : // do not make it > 0
                    boxPos.x - centerPos.x < -5 ? DirectionEnum.E : // do not make it < 0
                    boxPos.z - centerPos.z >  5 ? DirectionEnum.N : DirectionEnum.S; // same here ...
        // Update all the panels for the next frame
        const direction: Direction = new Direction(dir);

        // The following order is fundamental, do not mess it up
        let tmpColor: pc.Color = tiles.getTile(direction.getOpposite().repeat(2)).getColor();
        tiles.getTile(direction.getOpposite().repeat(2)).remove();
        tiles.getTile("cc").updateKey(direction.getOpposite().repeat(2));
        // Update the center panel for the next frame
        tiles.getTile(`${direction.getCurrent()}`.repeat(2)).updateKey("cc");
        
        new Tile(`${direction.getCurrent()}`.repeat(2), tiles, app, tiles.getTile("cc").getEntity().getPosition().add(direction.getDelta()), tmpColor);

        for (const other of direction.getTransverse()) {

            let tmpColor = tiles.getTile(direction.getCorner("back", other)).getColor();
            tiles.getTile(direction.getCorner("back", other)).remove();
            tiles.getTile(`${other}`.repeat(2)).updateKey(direction.getCorner("back", other));
            tiles.getTile(direction.getCorner("front", other)).updateKey(`${other}`.repeat(2));

            new Tile(direction.getCorner("front", other), tiles, app, tiles.getTile(`${other}`.repeat(2)).getEntity().getPosition().add(direction.getDelta()), tmpColor);
        }
    }
    // centerMap is the tile's center position
    const centerTile = tileMap.getTile("cc");
    const centerMap = centerTile.getEntity().getPosition();
    const tileCoord = centerTile.getMetadata().tile_coord;

    // here to use const tileCoord.minLon is a good approx. to take into account tiles are not "squared"
    const latSize=tileMap.measure(tileCoord.minLat, tileCoord.minLon, tileCoord.maxLat, tileCoord.minLon);
    // here to use const tileCoord.minLat is a good approx. to take into account tiles are not "squared"
    const lonSize=tileMap.measure(tileCoord.minLat, tileCoord.minLon, tileCoord.minLat, tileCoord.maxLon);

    const latHalfWidth = latSize/2;
    const lonHalfWidth = lonSize/2;

    // Determine boundary crossing
    if (Math.abs(boxPos.x - centerMap.x) > lonHalfWidth || Math.abs(boxPos.z - centerMap.z) > latHalfWidth) {
        console.log('EXITED from the central tile', centerMap.x, boxPos.x, centerMap.z, boxPos.z);
        const exit_dir: DirectionEnum = 
                    boxPos.x - centerMap.x >   lonHalfWidth ? DirectionEnum.E :
                    boxPos.x - centerMap.x < - lonHalfWidth ? DirectionEnum.W :
                    boxPos.z - centerMap.z >   latHalfWidth ? DirectionEnum.S : DirectionEnum.N;
        // Update all the panels for the next frame
        const exit_direction: Direction = new Direction(exit_dir);
        // Implement your logic for when the player exits the tile
        console.log(boxPos)
        console.log(centerMap)
        console.log(exit_direction)
    }
});