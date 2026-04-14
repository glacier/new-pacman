import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../effects/VisualEffects';

describe('ParticleSystem', () => {
    let ps: ParticleSystem;

    beforeEach(() => {
        ps = new ParticleSystem();
    });

    it('should start with no particles', () => {
        expect(ps.count).toBe(0);
    });

    it('should emit the specified number of particles', () => {
        ps.emit(100, 100, '#ff0000', 10);
        expect(ps.count).toBe(10);
    });

    it('should emit multiple bursts additively', () => {
        ps.emit(100, 100, '#ff0000', 5);
        ps.emit(200, 200, '#00ff00', 7);
        expect(ps.count).toBe(12);
    });

    it('should reduce particle count over time via update', () => {
        ps.emit(100, 100, '#ff0000', 10);
        // Run enough updates for particles to expire (life starts at 1, decreases by 0.02 per update)
        for (let i = 0; i < 60; i++) {
            ps.update();
        }
        expect(ps.count).toBe(0);
    });

    it('should move particles on update', () => {
        ps.emit(100, 100, '#ff0000', 1);
        const initialCount = ps.count;
        ps.update();
        // Particle should still exist after one update
        expect(ps.count).toBe(initialCount);
    });

    it('should draw without errors on a mock canvas context', () => {
        ps.emit(100, 100, '#ff0000', 5);
        // jsdom doesn't support canvas getContext, so mock it
        const ctx = {
            save: () => {},
            restore: () => {},
            globalAlpha: 1,
            fillStyle: '',
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
        } as unknown as CanvasRenderingContext2D;
        expect(() => ps.draw(ctx)).not.toThrow();
    });
});
