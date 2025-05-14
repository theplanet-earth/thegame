import * as pc from 'playcanvas';

export class Character {
    private app: pc.Application;
    private entity: pc.Entity;
    private animMap: Record<string, pc.Asset> = {};
    private currentAnim: string = 'idle';
    private isPlayingSpecial = false;
    private specialTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(app: pc.Application, position: pc.Vec3) {
        this.app = app;
        this.entity = new pc.Entity('player');
        this.loadModel(position);
    }

    public getEntity(): pc.Entity {
        return this.entity;
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
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

    private loadModel(position: pc.Vec3): void {
        this.app.assets.loadFromUrl('/assets/merged.glb', 'container', (err, asset) => {
            if (err) {
                console.error('Failed to load model:', err);
                return;
            }

            const container = asset.resource as pc.ContainerResource;
            const modelRoot = container.instantiateModelEntity();
            modelRoot.setLocalPosition(position);
            modelRoot.setLocalScale(1, 1, 1);
            this.app.root.addChild(modelRoot);
            this.entity = modelRoot;

            // Setup animations
            this.entity.addComponent('animation', {
                assets: container.animations,
                activate: true,
            });

            this.animMap = {
                idle: container.animations.find(a => a.name.toLowerCase().includes('animation/0'))!,
                walk: container.animations.find(a => a.name.toLowerCase().includes('animation/1'))!,
                yessiree: container.animations.find(a => a.name.toLowerCase().includes('animation/2'))!,
            };

            this.animMap.idle.resource.loop = true;
            this.animMap.walk.resource.loop = true;
            this.animMap.yessiree.resource.loop = false;

            this.play('idle');
        });
    }

    public play(name: 'idle' | 'walk' | 'yessiree', blend: number = 0.2, loop: boolean = true): void {
        if (!this.entity.animation || this.currentAnim === name || !this.animMap[name]) return;

        this.entity.animation.loop = loop;
        this.entity.animation.play(this.animMap[name].name, blend);
        this.currentAnim = name;
    }

    public transitionToYessiree(walkPressed: boolean): void {
        if (this.isPlayingSpecial || !this.animMap.yessiree) return;

        this.isPlayingSpecial = true;
        this.play('yessiree', 0.2, false);

        const duration = this.animMap.yessiree.resource.duration;
        this.specialTimeout = setTimeout(() => {
            this.isPlayingSpecial = false;
            this.specialTimeout = null;
            this.play(walkPressed ? 'walk' : 'idle');
        }, duration * 1000);
    }

    public interruptSpecialAnimation(): void {
        if (this.specialTimeout) {
            clearTimeout(this.specialTimeout);
            this.specialTimeout = null;
            this.isPlayingSpecial = false;
        }
    }

    public isSpecialPlaying(): boolean {
        return this.isPlayingSpecial;
    }
}
