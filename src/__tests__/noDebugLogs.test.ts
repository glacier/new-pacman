import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('No debug console.log statements in source', () => {
    const srcFiles = [
        'entities/Player.ts',
        'entities/Monster.ts',
        'world/Maze.ts',
        'engine/physics.ts',
        'main.ts',
    ];

    for (const file of srcFiles) {
        it(`${file} should not contain console.log`, () => {
            const content = readFileSync(resolve(__dirname, '..', file), 'utf-8');
            expect(content).not.toMatch(/console\.log\(/);
        });
    }
});
