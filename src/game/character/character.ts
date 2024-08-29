import * as pc from 'playcanvas';

export class Character {
    private app: pc.Application;
    private entity: pc.Entity;

    constructor(app: pc.Application, position: pc.Vec3) {
        this.app = app;
        this.createEntity(position);
    }

    // Box setup
    private createEntity(position: pc.Vec3): void {
        this.entity = new pc.Entity('player');
        this.entity.addComponent('model', {
            type: 'box'
        });
        this.entity.setLocalScale(new pc.Vec3(1, 1, 1));
        this.entity.setPosition(position);

        // Material setup for box
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.5, 1, 0.5); // Acid Green
        material.update();
        this.entity.model.meshInstances[0].material = material;

        this.app.root.addChild(this.entity);
    }

    public getEntity(): pc.Entity {
        return this.entity;
    }

    public translate(delta: pc.Vec3): void {
        this.entity.translate(delta);
    }

    public translateLocal(delta: pc.Vec3): void {
        this.entity.translateLocal(delta);
    }

    public rotate(angle: pc.Vec3): void {
        this.entity.rotateLocal(angle.x, angle.y, angle.z);
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }
}