import { physics } from '../engine/physics';
import RBush from 'rbush';

export interface WallItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    body: Matter.Body;
}

export class Maze {
    public walls: Matter.Body[] = [];
    public wallIndex: RBush<WallItem>;
    public mazeHealth: number = 100;
    private wallWidth: number = 40;
    private wallHeight: number = 40;

    constructor() {
        this.wallIndex = new RBush<WallItem>();
    }

    generateLevel(level: number) {
        // Clear existing walls
        this.walls.forEach(wall => physics.removeBody(wall));
        this.walls = [];
        this.wallIndex.clear();
        
        // Define grid dimensions (must be odd for the wall-cell algorithm)
        // 960 / 40 = 24. We'll use 23 columns.
        // 640 / 40 = 16. We'll use 15 rows.
        const cols = 23;
        const rows = 15;
        
        // Boundaries (solid static bodies)
        physics.addStaticBody(480, 630, 960, 20); // Floor
        physics.addStaticBody(480, 10, 960, 20);  // Ceiling
        physics.addStaticBody(10, 320, 20, 640);  // Left Wall
        physics.addStaticBody(950, 320, 20, 640); // Right Wall

        // Initialize grid: true = wall, false = passage
        const grid: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(true));
        
        // Recursive Backtracker
        const stack: [number, number][] = [];
        const startR = 1;
        const startC = 1;
        
        grid[startR][startC] = false;
        stack.push([startR, startC]);
        
        while (stack.length > 0) {
            const [r, c] = stack[stack.length - 1];
            const neighbors: [number, number, number, number][] = [];
            
            // Check potential neighbors (2 steps away)
            const dirs = [
                [0, 2, 0, 1],   // Right
                [0, -2, 0, -1],  // Left
                [2, 0, 1, 0],   // Down
                [-2, 0, -1, 0]   // Up
            ];
            
            for (const [dr, dc, wr, wc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc]) {
                    neighbors.push([nr, nc, r + wr, c + wc]);
                }
            }
            
            if (neighbors.length > 0) {
                const [nr, nc, wr, wc] = neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[nr][nc] = false; // The cell
                grid[wr][wc] = false; // The wall between
                stack.push([nr, nc]);
            } else {
                stack.pop();
            }
        }

        // Add "corruption" to make it more open at higher levels
        // Levels 1-10: remove more random walls
        const corruptionFactor = 0.45 + (level * 0.02);
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (grid[r][c] && Math.random() < corruptionFactor) {
                    grid[r][c] = false;
                }
            }
        }

        // Ensure start area is clear (around index 13, 2)
        // Player starts at x:100, y:500 approx.
        const playerGridR = Math.floor(520 / 40);
        const playerGridC = Math.floor(100 / 40);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const r = playerGridR + i;
                const c = playerGridC + j;
                if (r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
                    grid[r][c] = false;
                }
            }
        }

        // Create Matter.js bodies for remaining walls
        // Offset to center the maze in the 960x640 area
        const offsetX = (960 - (cols * 40)) / 2;
        const offsetY = (640 - (rows * 40)) / 2;

        const wallItems: WallItem[] = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c]) {
                    const x = offsetX + c * this.wallWidth + this.wallWidth / 2;
                    const y = offsetY + r * this.wallHeight + this.wallHeight / 2;
                    
                    const wall = physics.addStaticBody(x, y, this.wallWidth, this.wallHeight, {
                        label: 'destructibleWall',
                        render: {
                            fillStyle: 'transparent',
                            strokeStyle: 'transparent',
                            sprite: {
                                texture: `${import.meta.env.BASE_URL}brick.png`,
                                xScale: 0.0625,
                                yScale: 0.0625
                            }
                        }
                    } as Matter.IChamferableBodyDefinition);
                    this.walls.push(wall);
                    wallItems.push({
                        minX: wall.bounds.min.x,
                        minY: wall.bounds.min.y,
                        maxX: wall.bounds.max.x,
                        maxY: wall.bounds.max.y,
                        body: wall
                    });
                }
            }
        }

        this.wallIndex.load(wallItems);

        this.mazeHealth = 100;
        this.updateUI();
    }

    damageWall(_wallBody: Matter.Body, amount: number) {
        this.mazeHealth -= amount;
        if (this.mazeHealth < 0) this.mazeHealth = 0;
        this.updateUI();
    }

    updateUI() {
        const bar = document.getElementById('maze-health-bar');
        const text = document.getElementById('maze-health-text');
        if (bar) bar.style.width = `${this.mazeHealth}%`;
        if (text) text.innerText = `${Math.floor(this.mazeHealth)}%`;
    }
}
