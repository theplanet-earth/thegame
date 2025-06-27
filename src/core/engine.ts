import * as pc from 'playcanvas';
import { MovementConfig } from './config';

// Application setup with explicit type assignment
export class Engine {
    public app: pc.Application;
    public canvas: HTMLCanvasElement;
    public movement: MovementConfig;
    public light: pc.Entity;
    public camera: pc.Entity;

    constructor(movementConfig: MovementConfig) {
        this.canvas = document.getElementById('application') as HTMLCanvasElement;
        this.app = new pc.Application(this.canvas, {
            keyboard: new pc.Keyboard(window)
        });

        this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);

        this.movement = movementConfig;

        this.setupLighting();
        this.setupCamera();
    }

    // Lighting setup
    private setupLighting(): void {
        this.light = new pc.Entity('light');
        this.light.addComponent('light');
        this.light.setEulerAngles(45, 0, 0);
        this.app.root.addChild(this.light);
    }

    // Camera setup
    private setupCamera(): void {
        this.camera = new pc.Entity('camera');
        this.camera.addComponent('camera', {
            clearColor: new pc.Color(0.3, 0.3, 0.7)
        });
        this.camera.setPosition(new pc.Vec3(0, 5, -10));
        this.app.root.addChild(this.camera);
    }

    // This method has to be invoked once the gameManager
    // is completely setup.
    start(): void {
        console.info('Starting the application...');
        this.app.start();
        
        // Log before dispatching the event
        console.info('Dispatching appReady event.');
        // After app is fully configured
        document.dispatchEvent(new CustomEvent('appReady', { detail: { app: this.app } }));
    }    
}