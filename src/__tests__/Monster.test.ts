import { describe, it, expect } from 'vitest';
import { Monster } from '../entities/Monster';

describe('Monster', () => {
    it('should have update method', () => {
        expect(typeof Monster.prototype.update).toBe('function');
    });

    it('should have takeDamage method', () => {
        expect(typeof Monster.prototype.takeDamage).toBe('function');
    });

    it('should have interrupt method', () => {
        expect(typeof Monster.prototype.interrupt).toBe('function');
    });

    it('should have findNearestWall method', () => {
        expect(typeof Monster.prototype.findNearestWall).toBe('function');
    });

    it('should have smash method', () => {
        expect(typeof Monster.prototype.smash).toBe('function');
    });
});
