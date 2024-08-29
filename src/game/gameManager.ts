import * as pc from 'playcanvas';
import { Engine } from '../core/engine';
import { TileManager } from './tiles/tileManager';
// import { TileMap } from '../debug/tiles/tileManager';
import { Character } from './character/character';
import { Controller } from './character/controller';
import { MovementConfig, DEFAULT_MOVEMENT_CONFIG } from '../core/config';

export class GameManager {
    engine: Engine;
    private tileManager?: TileManager;
    // private floorManager?: TileMap; // for debug purpose only!
    private character?: Character;
    private controller?: Controller;

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
            // this.floorManager = new TileMap(this.engine.app); // for debug purpose only!
    
            // Wait for the TileManager to be fully initialized
            await this.tileManager.ready;
    
            // Proceed to initialize the rest of the game
            this.initializeGame();
        });
    
        // Adding a log to confirm that the listener setup is complete
        console.info('initialize:coordinates event listener setup complete.');
    }

    private initializeGame(): void {
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
        this.character = new Character(this.engine.app, centerPosition.add2(centerTile.getPosition(), new pc.Vec3(0, 0.5, 0)));
        this.controller = new Controller(this.engine, this.character, DEFAULT_MOVEMENT_CONFIG, this.tileManager);//, this.floorManager);
    }
}