import * as pc from 'playcanvas';

export enum DirectionEnum {
    N = "n", E = "e", S = "s", W = "w"
}

export class Direction {
    current: DirectionEnum;
    opposite: DirectionEnum;
    delta: pc.Vec3;

    constructor(direction: DirectionEnum) {
        this.current = direction;
        this.calculateProperties();
    }

    private calculateProperties(): void {
        // Logic to determine opposite and delta
        switch (this.current) {
            case DirectionEnum.N:
                this.opposite =  DirectionEnum.S;
                this.delta = new pc.Vec3(0, 0, 10);
                break; // Ensure each case has a break to prevent fall-through.
            case DirectionEnum.E:
                this.opposite =  DirectionEnum.W;
                this.delta = new pc.Vec3(- 10, 0, 0);
                break;
            case DirectionEnum.S:
                this.opposite =  DirectionEnum.N;
                this.delta = new pc.Vec3(0, 0, - 10);
                break;
            case DirectionEnum.W:
                this.opposite =  DirectionEnum.E;
                this.delta = new pc.Vec3(10, 0, 0);
                break;
        }
    }

    getCurrent(): DirectionEnum {
        return this.current;
    }

    getOpposite(): DirectionEnum {
        return this.opposite;
    }

    getDelta(): pc.Vec3 {
        return this.delta;
    }

    getTransverse(): DirectionEnum[] {
        // Logic to return transverse directions based on current
        switch (this.getCurrent()) {
            case DirectionEnum.N:
            case DirectionEnum.S:
                return [DirectionEnum.W, DirectionEnum.E];
            case DirectionEnum.E:
            case DirectionEnum.W:
                return [DirectionEnum.N, DirectionEnum.S];
        }
        
    }

    getCorner(direction: string, other: DirectionEnum): string {
        // Logic to determine corner direction
        switch (this.getCurrent()) {
            case DirectionEnum.N:
            case DirectionEnum.S:
                switch(direction) {
                    case "front":
                        return `${this.getCurrent()}${other}`;
                    case "back":
                        return `${this.getOpposite()}${other}`;
                }
                break; // Add breaks to prevent unintended fall-through
            case DirectionEnum.E:
            case DirectionEnum.W:
                switch(direction) {
                    case "front":
                        return `${other}${this.getCurrent()}`;
                    case "back":
                        return `${other}${this.getOpposite()}`;
                }
                break; // Add breaks to prevent unintended fall-through
        }
        return "XX"; // Return statement for any unmatched case
    }
}
