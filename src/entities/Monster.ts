import { Body, Vector } from 'matter-js';
import { physics } from '../engine/physics';
import { sound } from '../audio/SoundManager';
import { Maze } from '../world/Maze';
import knn from 'rbush-knn';

export class Monster {
    public body: Body;
    public health: number = 10;
    public isDead: boolean = false;
    private targetWall: Body | null = null;
    private level: number;
    private maze: Maze;
    private isInterrupted: boolean = false;
    private interruptTimer: number = 0;
    private state: 'SMASHING' | 'WANDERING' | 'IDLE' = 'WANDERING';
    public isTouchingWall: boolean = false;
    private speed: number = 1.5;
    private direction: { x: number, y: number } = { x: 0, y: 0 };
    private changeDirectionTimer: number = 0;
    private attackCooldown: number = 0;
    private smashSoundCooldown: number = 0;

    constructor(x: number, y: number, maze: Maze, level: number) {
        this.maze = maze;
        this.level = level;
        this.body = physics.addDynamicBody(x, y, 32, 32, {
            friction: 0.1,
            frictionAir: 0.1,
            inertia: Infinity,
            label: 'monster',
            render: {
                fillStyle: 'transparent',
                strokeStyle: 'transparent',
                sprite: {
                    texture: `${import.meta.env.BASE_URL}monster.png`,
                    xScale: 0.08,
                    yScale: 0.08
                }
            }
        } as Matter.IChamferableBodyDefinition);

        this.pickRandomDirection();
    }

    update() {
        if (this.isDead) return;

        this.isTouchingWall = false;

        const bounds = {
            minX: this.body.position.x - 40,
            minY: this.body.position.y - 40,
            maxX: this.body.position.x + 40,
            maxY: this.body.position.y + 40
        };

        const nearbyWalls = this.maze.wallIndex.search(bounds);

        for (let i = 0; i < nearbyWalls.length; i++) {
            const wall = nearbyWalls[i].body;
            const dx = this.body.position.x - wall.position.x;
            const dy = this.body.position.y - wall.position.y;
            if (dx * dx + dy * dy < 1600) { // 40^2
                this.isTouchingWall = true;
                break;
            }
        }

        if (this.smashSoundCooldown > 0) this.smashSoundCooldown--;

        if (this.isInterrupted) {
            this.interruptTimer--;
            if (this.interruptTimer <= 0) this.isInterrupted = false;
            return;
        }

        if (this.state === 'SMASHING') {
            if (this.targetWall) {
                this.smash();
                if (Math.random() < 0.01) this.state = 'WANDERING';
            } else {
                this.state = 'WANDERING';
            }
            return;
        }

        if (this.state === 'WANDERING') {
            this.move();

            if (Math.random() < 0.005) {
                this.findNearestWall();
                if (this.targetWall) {
                    const dx = this.body.position.x - this.targetWall.position.x;
                    const dy = this.body.position.y - this.targetWall.position.y;
                    if (dx * dx + dy * dy < 2500) { // 50^2
                        this.state = 'SMASHING';
                    }
                }
            }

            this.changeDirectionTimer--;
            if (this.changeDirectionTimer <= 0 || this.checkWallCollision()) {
                this.pickRandomDirection();
            }
        }

        this.checkPlayerAttack();
    }

    private checkPlayerAttack() {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        const playerBody = physics.engine.world.bodies.find(b => b.label === 'player');
        if (playerBody) {
            const diff = Vector.sub(playerBody.position, this.body.position);
            const dist = Vector.magnitude(diff);

            if (dist < 45) {
                const forceMagnitude = 0.02;
                const force = Vector.mult(Vector.normalise(diff), forceMagnitude);
                Body.applyForce(playerBody, playerBody.position, force);

                (playerBody as any).incomingDamage = 5;
                this.attackCooldown = 60;
            }
        }
    }

    private move() {
        Body.setVelocity(this.body, {
            x: this.direction.x * this.speed,
            y: this.direction.y * this.speed
        });
    }

    private pickRandomDirection() {
        const dirs = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 }
        ];
        this.direction = dirs[Math.floor(Math.random() * dirs.length)];
        this.changeDirectionTimer = 60 + Math.random() * 120;
    }

    private checkWallCollision() {
        const speed = Vector.magnitude(this.body.velocity);
        return speed < 0.1 && (this.direction.x !== 0 || this.direction.y !== 0);
    }

    findNearestWall() {
        const results = knn(this.maze.wallIndex, this.body.position.x, this.body.position.y, 1);
        if (results && results.length > 0) {
            this.targetWall = results[0].body;
        } else {
            this.targetWall = null;
        }
    }

    smash() {
        const baseDamage = 0.0014;
        const levelMultiplier = 1 + (this.level - 1) * 0.5;
        this.maze.damageWall(this.targetWall!, baseDamage * levelMultiplier);
        Body.setVelocity(this.body, { x: 0, y: 0 });

        if (this.smashSoundCooldown <= 0) {
            sound.play('wallSmash');
            this.smashSoundCooldown = 30;
        }
    }

    takeDamage(amount: number) {
        if (this.isDead) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    private die() {
        this.isDead = true;
        this.state = 'IDLE';
        physics.removeBody(this.body);
    }

    interrupt() {
        this.isInterrupted = true;
        this.interruptTimer = 60;
        this.state = 'WANDERING';
        this.pickRandomDirection();
    }
}
