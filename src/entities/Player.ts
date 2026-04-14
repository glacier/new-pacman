import { Body, Vector } from 'matter-js';
import { physics } from '../engine/physics';
import { sound } from '../audio/SoundManager';
import { screenShake } from '../effects/ScreenShake';
import { damageFlash } from '../effects/VisualEffects';
import type { Monster } from './Monster';

export class Player {
    public body: Body;
    public health: number = 100;
    private width: number = 24;
    private height: number = 24;
    private speed: number = 3;

    public isPunching: boolean = false;
    public isKicking: boolean = false;
    private keys: Record<string, boolean> = {};

    constructor() {
        this.body = physics.addDynamicBody(100, 500, this.width, this.height, {
            inertia: Infinity,
            friction: 0,
            frictionAir: 0.1,
            label: 'player',
            render: {
                fillStyle: 'transparent',
                strokeStyle: 'transparent',
                sprite: {
                    texture: `${import.meta.env.BASE_URL}character.png`,
                    xScale: 0.1,
                    yScale: 0.1
                }
            }
        } as Matter.IChamferableBodyDefinition);
    }

    update(monsters: Monster[]) {
        let vx = 0;
        let vy = 0;

        if (this.keys['ArrowLeft'] || this.keys['a']) vx = -this.speed;
        else if (this.keys['ArrowRight'] || this.keys['d']) vx = this.speed;

        if (this.keys['ArrowUp'] || this.keys['w']) vy = -this.speed;
        else if (this.keys['ArrowDown'] || this.keys['s']) vy = this.speed;

        Body.setVelocity(this.body, { x: vx, y: vy });

        // Check for incoming damage from monsters (set by Monster.ts)
        if ((this.body as any).incomingDamage) {
            this.takeDamage((this.body as any).incomingDamage);
            (this.body as any).incomingDamage = 0;
        }

        // Squeeze Logic: If player is pushing monster against wall
        monsters.forEach(monster => {
            const dist = Vector.magnitude(Vector.sub(this.body.position, monster.body.position));
            if (dist < 35 && monster.isTouchingWall) {
                monster.takeDamage(0.05);
            }
        });
    }

    takeDamage(amount: number) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        sound.play('playerHit');
        screenShake.trigger(4);
        damageFlash.trigger();
        this.updateHealthUI();
    }

    private updateHealthUI() {
        const bar = document.getElementById('player-health-bar');
        if (bar) {
            bar.style.width = `${this.health}%`;
            if (this.health < 30) bar.style.backgroundColor = '#ff4444';
            else if (this.health < 60) bar.style.backgroundColor = '#ffbb33';
            else bar.style.backgroundColor = '#00C851';
        }
    }

    resetHealth() {
        this.health = 100;
        this.updateHealthUI();
    }

    punch(monsters: Monster[]) {
        if (this.isPunching) return;
        this.isPunching = true;

        let hitAny = false;
        monsters.forEach(monster => {
            const dist = Vector.magnitude(Vector.sub(this.body.position, monster.body.position));
            if (dist < 80) {
                monster.takeDamage(1);
                monster.interrupt();
                hitAny = true;
            }
        });

        sound.play('punch');
        if (hitAny) screenShake.trigger(3);

        setTimeout(() => this.isPunching = false, 200);
    }

    kick(monsters: Monster[]) {
        if (this.isKicking) return;
        this.isKicking = true;

        let hitAny = false;
        monsters.forEach(monster => {
            const diff = Vector.sub(monster.body.position, this.body.position);
            const dist = Vector.magnitude(diff);
            if (dist < 100) {
                monster.takeDamage(1);
                const forceMagnitude = 0.05;
                const force = Vector.mult(Vector.normalise(diff), forceMagnitude);
                Body.applyForce(monster.body, monster.body.position, force);
                hitAny = true;
            }
        });

        sound.play('kick');
        if (hitAny) screenShake.trigger(5);

        setTimeout(() => this.isKicking = false, 500);
    }

    handleInput(keys: Record<string, boolean>) {
        this.keys = keys;
    }
}
