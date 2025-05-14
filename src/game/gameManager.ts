import * as pc from 'playcanvas';
import { Engine } from '../core/engine';
import { TileManager } from './tiles/tileManager';
import { MovementConfig, DEFAULT_MOVEMENT_CONFIG } from '../core/config';

let TileMap: any;
let CharacterModule, ControllerModule;

if (__DEBUG__) {
    TileMap = (await import('../debug/tiles/tileManager')).TileMap;
    CharacterModule = await import('../debug/character/character');
    ControllerModule = await import('../debug/character/controller');
} else {
    CharacterModule = await import('./character/character');
    ControllerModule = await import('./character/controller');
}

const Character = CharacterModule.Character;
const Controller = ControllerModule.Controller;

export class GameManager {
    engine: Engine;
    private tileManager?: TileManager;
    private floorManager?: InstanceType<typeof TileMap>; // for debug purpose only!
    private character?: InstanceType<typeof Character>;
    private controller?: InstanceType<typeof Controller>;

    constructor() {
        this.engine = new Engine(DEFAULT_MOVEMENT_CONFIG);
        console.info('Engine initialized.');

        // Adding log to ensure we are setting up the event listener
        console.info('Setting up initialize:coordinates event listener.');
    
        // Listen for the 'initialize:coordinates' event before initializing the game
        this.engine.app.on('initialize:coordinates', async (coordinates) => {
            console.info('Coordinates received:', coordinates);

            // Initialize TileManager with received coordinates
            this.tileManager = new TileManager(this.engine.app, coordinates.lat, coordinates.lng);
            if (__DEBUG__ && TileMap) {
                this.floorManager = new TileMap(this.engine.app); // for debug purpose only!
            }

            // Wait for the TileManager to be fully initialized
            await this.tileManager.ready;

            // Proceed to initialize the rest of the game
            this.initializeGame();
        });

        // Adding a log to confirm that the listener setup is complete
        console.info('initialize:coordinates event listener setup complete.');
    }

    private async initializeGame(): Promise<void> {
        if (!this.tileManager) {
            console.error("TileManager has not been initialized.");
            return;
        }

        const centerTile = this.tileManager.getTile('cc');
        if (!centerTile) {
            console.error("Center tile (cc) could not be found.");
            return;
        }

        const centerPosition = new pc.Vec3();
        const position = centerPosition.add2(centerTile.getPosition(), new pc.Vec3(0, 0.5, 0));

        this.character = new Character(this.engine.app, position);
        this.controller = new Controller(
            this.engine, this.character, DEFAULT_MOVEMENT_CONFIG, this.tileManager,
            __DEBUG__ ? this.floorManager : undefined
        );
    }
}
