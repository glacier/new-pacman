import './style.css'; // Vite handles CSS imports
import { Body } from 'matter-js';
import { physics } from './engine/physics';
import { Maze } from './world/Maze';
import { Player } from './entities/Player';
import { Monster } from './entities/Monster';

class GameEngine {
    private level: number = 1;
    private strikes: number = 3;
    private keys: Record<string, boolean> = {};
    private maze!: Maze;
    private player!: Player;
    private monsters: Monster[] = [];

    constructor() {
        this.init();
    }

    private init() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        physics.init(canvas);

        this.maze = new Maze();
        this.maze.generateLevel(this.level);

        this.player = new Player();
        
        this.spawnMonsters();
        this.setupControls();
        this.gameLoop();
    }

    private spawnMonsters() {
        // Clear existing monsters and their physics bodies
        this.monsters.forEach(m => physics.removeBody(m.body));
        this.monsters = [];

        const count = 4;
        for (let i = 0; i < count; i++) {
            // Random position across the maze (960x640)
            let x, y;
            do {
                x = 100 + Math.random() * 760;
                y = 100 + Math.random() * 440;
                // Don't spawn on top of player's start (100, 500)
            } while (Math.hypot(x - 100, y - 500) < 150);
            
            this.monsters.push(new Monster(x, y, this.maze, this.level));
        }
    }

    private setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp') this.player.jump();
            if (e.key === 'f') this.player.punch(this.monsters);
            if (e.key === 'e') this.player.kick(this.monsters);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch Controls
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnJump = document.getElementById('btn-jump');
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
        if (btnJump) btnJump.addEventListener('touchstart', () => this.player.jump());
        if (btnPunch) btnPunch.addEventListener('touchstart', () => this.player.punch(this.monsters));
        if (btnKick) btnKick.addEventListener('touchstart', () => this.player.kick(this.monsters));

        if ('ontouchstart' in window) {
            document.getElementById('mobile-controls')?.classList.remove('hidden');
        }
    }

    private gameLoop() {
        this.player.handleInput(this.keys);
        this.player.update(this.monsters);

        this.monsters.forEach(m => m.update());
        this.monsters = this.monsters.filter(m => !m.isDead);

        if (this.monsters.length === 0) {
            this.handleLevelComplete();
        }

        if (this.maze.mazeHealth <= 0 || this.player.health <= 0) {
            this.handleFail();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    private handleLevelComplete() {
        this.level++;
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
