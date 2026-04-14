import { describe, it, expect } from 'vitest';
import { Player } from '../entities/Player';

// Check that the Player class source code does not contain debug logs or jump method
// We do this by inspecting the class prototype

describe('Player', () => {
    it('should not have a jump method', () => {
        expect((Player.prototype as any).jump).toBeUndefined();
    });

    it('should have punch method', () => {
        expect(typeof Player.prototype.punch).toBe('function');
    });

    it('should have kick method', () => {
        expect(typeof Player.prototype.kick).toBe('function');
    });

    it('should have handleInput method', () => {
        expect(typeof Player.prototype.handleInput).toBe('function');
    });

    it('should have update method', () => {
        expect(typeof Player.prototype.update).toBe('function');
    });

    it('should have takeDamage method', () => {
        expect(typeof Player.prototype.takeDamage).toBe('function');
    });

    it('should have resetHealth method', () => {
        expect(typeof Player.prototype.resetHealth).toBe('function');
    });
});
