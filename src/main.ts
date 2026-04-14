import './style.css';
import { Body, Runner } from 'matter-js';
import { physics } from './engine/physics';
import { Maze } from './world/Maze';
import { Player } from './entities/Player';
import { Monster } from './entities/Monster';
import { sound } from './audio/SoundManager';
import { screenShake } from './effects/ScreenShake';
import { particles, damageFlash } from './effects/VisualEffects';

class GameEngine {
    private level: number = 1;
    private strikes: number = 3;
    private keys: Record<string, boolean> = {};
    private maze!: Maze;
    private player!: Player;
    private monsters: Monster[] = [];
    private paused: boolean = false;
    private particleCanvas!: HTMLCanvasElement;
    private particleCtx!: CanvasRenderingContext2D;

    constructor() {
        this.init();
    }

    private init() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const container = document.getElementById('game-container') as HTMLElement;
        physics.init(canvas);

        // Set up particle overlay canvas
        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.width = 960;
        this.particleCanvas.height = 640;
        this.particleCanvas.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
        container.appendChild(this.particleCanvas);
        this.particleCtx = this.particleCanvas.getContext('2d')!;

        // Init effects
        screenShake.init(container);
        damageFlash.init(container);

        this.maze = new Maze();
        this.maze.generateLevel(this.level);

        this.player = new Player();

        this.spawnMonsters();
        this.setupControls();
        this.setupResponsiveScaling();
        this.gameLoop();
    }

    private spawnMonsters() {
        this.monsters.forEach(m => physics.removeBody(m.body));
        this.monsters = [];

        const count = 4;
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = 100 + Math.random() * 760;
                y = 100 + Math.random() * 440;
            } while (Math.hypot(x - 100, y - 500) < 150);

            this.monsters.push(new Monster(x, y, this.maze, this.level));
        }
    }

    private setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p') {
                this.togglePause();
                return;
            }
            if (this.paused) return;
            this.keys[e.key] = true;
            if (e.key === 'f') this.player.punch(this.monsters);
            if (e.key === 'e') this.player.kick(this.monsters);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch Controls
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnPunch = document.getElementById('btn-punch');
        const btnKick = document.getElementById('btn-kick');

        if (btnLeft) {
            btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['a'] = true; });
            btnLeft.addEventListener('touchend', () => this.keys['a'] = false);
        }
        if (btnRight) {
            btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['d'] = true; });
            btnRight.addEventListener('touchend', () => this.keys['d'] = false);
        }
        if (btnUp) {
            btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['w'] = true; });
            btnUp.addEventListener('touchend', () => this.keys['w'] = false);
        }
        if (btnDown) {
            btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['s'] = true; });
            btnDown.addEventListener('touchend', () => this.keys['s'] = false);
        }
        if (btnPunch) btnPunch.addEventListener('touchstart', (e) => { e.preventDefault(); if (!this.paused) this.player.punch(this.monsters); });
        if (btnKick) btnKick.addEventListener('touchstart', (e) => { e.preventDefault(); if (!this.paused) this.player.kick(this.monsters); });

        // Pause / mute buttons
        const btnPause = document.getElementById('btn-pause');
        const btnMute = document.getElementById('btn-mute');
        if (btnPause) btnPause.addEventListener('click', () => this.togglePause());
        if (btnMute) btnMute.addEventListener('click', () => {
            sound.toggle();
            btnMute.classList.toggle('muted', sound.muted);
            btnMute.innerHTML = sound.muted ? '&#x1f507;' : '&#x1f50a;';
        });

        // Resume / quit in pause menu
        const resumeBtn = document.getElementById('resume-btn');
        const quitBtn = document.getElementById('quit-btn');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
        if (quitBtn) quitBtn.addEventListener('click', () => location.reload());

        if ('ontouchstart' in window) {
            document.getElementById('mobile-controls')?.classList.remove('hidden');
        }
    }

    private togglePause() {
        this.paused = !this.paused;
        const overlay = document.getElementById('pause-overlay');

        if (this.paused) {
            overlay?.classList.remove('hidden');
            Runner.stop(physics.runner);
        } else {
            overlay?.classList.add('hidden');
            Runner.run(physics.runner, physics.engine);
        }
    }

    private setupResponsiveScaling() {
        const resize = () => {
            const container = document.getElementById('game-container');
            if (!container) return;
            const scaleX = window.innerWidth / 960;
            const scaleY = window.innerHeight / 640;
            const scale = Math.min(scaleX, scaleY, 1);
            container.style.transformOrigin = 'center center';
            if (scale < 1) {
                container.style.transform = `scale(${scale})`;
            } else {
                container.style.transform = '';
            }
        };
        window.addEventListener('resize', resize);
        resize();
    }

    private gameLoop() {
        if (!this.paused) {
            this.player.handleInput(this.keys);
            this.player.update(this.monsters);

            const prevMonsterCount = this.monsters.length;
            this.monsters.forEach(m => m.update());
            this.monsters = this.monsters.filter(m => {
                if (m.isDead) {
                    // Emit death particles at monster's last position
                    particles.emit(m.body.position.x, m.body.position.y, '#ff4444', 15);
                    sound.play('monsterDeath');
                    screenShake.trigger(6);
                    return false;
                }
                return true;
            });

            if (this.monsters.length === 0 && prevMonsterCount > 0) {
                this.handleLevelComplete();
            }

            if (this.maze.mazeHealth <= 0 || this.player.health <= 0) {
                this.handleFail();
            }

            // Update effects
            screenShake.update();
            damageFlash.update();
            particles.update();

            // Draw particles
            this.particleCtx.clearRect(0, 0, 960, 640);
            particles.draw(this.particleCtx);
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    private handleLevelComplete() {
        this.level++;
        sound.play('levelComplete');
        this.updateLevelUI();
        this.resetLevel();
    }

    private updateLevelUI() {
        const display = document.getElementById('level-display');
        if (display) {
            display.innerText = `${this.level} / 10`;
        }
    }

    private handleFail() {
        this.strikes--;
        this.updateStrikesUI();
        if (this.strikes <= 0) {
            sound.play('gameOver');
            this.showTerminationNotice();
        } else {
            this.resetLevel();
        }
    }

    private updateStrikesUI() {
        const strikes = document.querySelectorAll('.strike');
        strikes.forEach((s, i) => {
            if (i >= this.strikes) s.classList.add('lost');
        });
    }

    private showTerminationNotice() {
        document.getElementById('modal-container')?.classList.remove('hidden');
        const btn = document.getElementById('modal-action');
        if (btn) btn.onclick = () => location.reload();
    }

    private resetLevel() {
        this.maze.mazeHealth = 100;
        this.maze.updateUI();
        this.player.resetHealth();
        this.maze.generateLevel(this.level);
        this.spawnMonsters();
        Body.setPosition(this.player.body, { x: 100, y: 500 });
        Body.setVelocity(this.player.body, { x: 0, y: 0 });
    }
}

// Start Game
window.onload = () => {
    new GameEngine();
};
