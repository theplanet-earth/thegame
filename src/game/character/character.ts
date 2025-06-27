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
        this.app.assets.loadFromUrl('/assets/mixamo.glb', 'container', (err, asset) => {
            if (err || !asset) {
                console.error('Failed to load model:', err);
                return;
            }

            const container = asset.resource as pc.ContainerResource & { animations: pc.Asset[] };
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
                ascending_stairs: container.animations.find(a => a.name.toLowerCase().includes('animation/0'))!,
                descending_stairs: container.animations.find(a => a.name.toLowerCase().includes('animation/1'))!,
                happy_walk: container.animations.find(a => a.name.toLowerCase().includes('animation/2'))!,
                idle: container.animations.find(a => a.name.toLowerCase().includes('animation/3'))!,
                left_strafe_run: container.animations.find(a => a.name.toLowerCase().includes('animation/4'))!,
                right_strafe_run: container.animations.find(a => a.name.toLowerCase().includes('animation/5'))!,
                sad_walk: container.animations.find(a => a.name.toLowerCase().includes('animation/6'))!,
                yessiree: container.animations.find(a => a.name.toLowerCase().includes('animation/7'))!,
                walk: container.animations.find(a => a.name.toLowerCase().includes('animation/8'))!,
                stop_walk: container.animations.find(a => a.name.toLowerCase().includes('animation/9'))!,
                talking_phone: container.animations.find(a => a.name.toLowerCase().includes('animation/10'))!,
                telling_secret: container.animations.find(a => a.name.toLowerCase().includes('animation/11'))!,
                left_strafe_walk: container.animations.find(a => a.name.toLowerCase().includes('animation/12'))!,
                right_strafe_walk: container.animations.find(a => a.name.toLowerCase().includes('animation/13'))!,
                backward: container.animations.find(a => a.name.toLowerCase().includes('animation/14'))!,
                walkup_stairs: container.animations.find(a => a.name.toLowerCase().includes('animation/15'))!,
                texting: container.animations.find(a => a.name.toLowerCase().includes('animation/16'))!,
            };

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

        const duration = (this.animMap.yessiree.resource as pc.Animation).duration;
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
