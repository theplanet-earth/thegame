import * as pc from 'playcanvas';
import { Tile as DebugTile } from './debug/tiles/tile';
import { TileMap } from './debug/tiles/tileManager';
import { Direction, DirectionEnum } from './game/utility';
import { Tile } from './game/tiles/tile';
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

async function handleTileUpdate(key: string, tileMap: TileManager, app: pc.Application, newColor: pc.Color) {
    let ccMetadata = tileMap.getTile("cc").getMetadata();
    let ccCoordinates = tileMap.centerCoordinates(ccMetadata.tile_coord);

    // Make HTTP POST request for the new tile
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
        const tileCoordinates = tileMap.centerCoordinates(tileMetadata.tile_coord);
        const posVec = tileMap.relativePosition(tileCoordinates.lat, tileCoordinates.lon, ccCoordinates.lat, ccCoordinates.lon).add(tileMap.getTile("cc").getPosition());
        new Tile(key, tileMap, app, posVec, tileMetadata, newColor);
    }
}

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
        
        new DebugTile(`${direction.getCurrent()}`.repeat(2), tiles, app, tiles.getTile("cc").getEntity().getPosition().add(direction.getDelta()), tmpColor);

        for (const other of direction.getTransverse()) {

            let tmpColor = tiles.getTile(direction.getCorner("back", other)).getColor();
            tiles.getTile(direction.getCorner("back", other)).remove();
            tiles.getTile(`${other}`.repeat(2)).updateKey(direction.getCorner("back", other));
            tiles.getTile(direction.getCorner("front", other)).updateKey(`${other}`.repeat(2));

            new DebugTile(direction.getCorner("front", other), tiles, app, tiles.getTile(`${other}`.repeat(2)).getEntity().getPosition().add(direction.getDelta()), tmpColor);
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

        // The following order is fundamental, do not mess it up
        let tmpColor: pc.Color = tileMap.getTile(exit_direction.getOpposite().repeat(2)).getColor();
        tileMap.getTile(exit_direction.getOpposite().repeat(2)).remove();
        tileMap.getTile("cc").updateKey(exit_direction.getOpposite().repeat(2));

        let key = `${exit_direction.getCurrent()}`.repeat(2)

        // Update the center panel for the next frame
        tileMap.getTile(key).updateKey("cc");

        // Call the async function to handle the HTTP request and tile update
        handleTileUpdate(key, tileMap, app, tmpColor)
        .then(() => console.log("Tile update handled successfully"))
        .catch(error => console.error("Error handling tile update:", error));

        for (const other of exit_direction.getTransverse()) {

            let tmpColor = tileMap.getTile(exit_direction.getCorner("back", other)).getColor();
            tileMap.getTile(exit_direction.getCorner("back", other)).remove();
            tileMap.getTile(`${other}`.repeat(2)).updateKey(exit_direction.getCorner("back", other));

            key = exit_direction.getCorner("front", other);

            tileMap.getTile(key).updateKey(`${other}`.repeat(2));

            handleTileUpdate(key, tileMap, app, tmpColor)
            .then(() => console.log("Tile update handled successfully"))
            .catch(error => console.error("Error handling tile update:", error));
        }
    }
});