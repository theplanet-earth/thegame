import * as pc from 'playcanvas';
import { Tile, TileInterface } from './Tile';
import { TileMap } from './TileMap';
import { Direction, DirectionEnum } from './DirectionUtils';

// Initialization and application setup here
async function fetchGLB(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
}
function loadGLBFromBlob(blob: Blob, onLoad: (container: pc.Entity) => void) {
    const url = URL.createObjectURL(blob);
    const asset = new pc.Asset('characterModel', 'container', { url: url });
    app.assets.add(asset);
    app.assets.load(asset);
    asset.on('load', () => {
        const container = asset.resource.instantiateRenderEntity();
        onLoad(container);
    });
    asset.on('error', (err, asset) => {
        console.error('Error loading asset:', err);
    });
}

// Helper function to format the filename
function getTileFilename(lat: number, lng: number): string {
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

// Function to initialize all surrounding tiles including the center
async function initializeSurroundingTiles(centerLat: number, centerLng: number) {
    const delta = 0.005; // degrees shift for surrounding tiles

    for (let dLat = -delta; dLat <= delta; dLat += delta) {
        for (let dLng = -delta; dLng <= delta; dLng += delta) {
            // Skip the central tile here if already loaded, or handle as needed
            if (dLat === 0 && dLng === 0) continue;

            const lat = centerLat + dLat;
            const lng = centerLng + dLng;
            initializeCharacter(lat, lng, centerLat, centerLng);
        }
    }
}

// Updated initialization function using dynamic coordinates
async function initializeCharacter(lat: number, lng: number, centerLat: number, centerLng: number) {
    try {
        const filename = getTileFilename(lat, lng);
        console.log('Coordinates received:', filename);
        const blob = await fetchGLB(`https://nestjs-deal.vercel.app/buildings/filename/${filename}.glb`);
        loadGLBFromBlob(blob, (model) => {
            model.setLocalPosition(calculatePositionFromCenter(lat, lng, centerLat, centerLng));
            app.root.addChild(model);
        });
    } catch (error) {
        console.error('Failed to load character:', error);
    }
}

function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
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

// Calculate position based on Haversine formula to place each model
function calculatePositionFromCenter(lat: number, lng: number, centerLat: number, centerLng: number): pc.Vec3 {
    const distanceLat = measure(centerLat, centerLng, lat, centerLng);
    const distanceLng = measure(centerLat, centerLng, centerLat, lng);

    // Determine direction to place tiles correctly in relation to the center
    const dirLat = lat > centerLat ? 1 : -1;
    const dirLng = lng > centerLng ? 1 : -1;

    return new pc.Vec3(distanceLng * dirLng, 0, distanceLat * dirLat);
}

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

app.on('initialize:coordinates', (coordinates) => {
    console.log('Coordinates received:', coordinates);
    // You can now use these coordinates to influence the game, such as setting an initial player position, etc.
    initializeCharacter(coordinates.lat, coordinates.lng, coordinates.lat, coordinates.lng);
    initializeSurroundingTiles(coordinates.lat, coordinates.lng);
});

app.start();

// After app is fully configured
document.dispatchEvent(new CustomEvent('appReady', { detail: { app } }));

// Lighting setup
const light: pc.Entity = new pc.Entity('light');
light.addComponent('light');
light.setEulerAngles(45, 0, 0);
app.root.addChild(light);

const tiles = new TileMap(app);

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
    const centerPos = tiles.getTile("CC").getEntity().getPosition();

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
        tiles.getTile("CC").updateKey(direction.getOpposite().repeat(2));
        // Update the center panel for the next frame
        tiles.getTile(`${direction.getCurrent()}`.repeat(2)).updateKey("CC");
        
        new Tile(`${direction.getCurrent()}`.repeat(2), tiles, app, tiles.getTile("CC").getEntity().getPosition().add(direction.getDelta()), tmpColor);

        for (const other of direction.getTransverse()) {

            let tmpColor = tiles.getTile(direction.getCorner("back", other)).getColor();
            tiles.getTile(direction.getCorner("back", other)).remove();
            tiles.getTile(`${other}`.repeat(2)).updateKey(direction.getCorner("back", other));
            tiles.getTile(direction.getCorner("front", other)).updateKey(`${other}`.repeat(2));

            new Tile(direction.getCorner("front", other), tiles, app, tiles.getTile(`${other}`.repeat(2)).getEntity().getPosition().add(direction.getDelta()), tmpColor);
        }
    }
});