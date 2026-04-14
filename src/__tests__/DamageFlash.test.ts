import { describe, it, expect, beforeEach } from 'vitest';
import { DamageFlash } from '../effects/VisualEffects';

describe('DamageFlash', () => {
    let flash: DamageFlash;
    let container: HTMLDivElement;

    beforeEach(() => {
        flash = new DamageFlash();
        container = document.createElement('div');
        flash.init(container);
    });

    it('should create an overlay element on init', () => {
        const overlay = container.querySelector('#damage-flash');
        expect(overlay).not.toBeNull();
    });

    it('should start with opacity 0', () => {
        flash.update();
        const overlay = container.querySelector('#damage-flash') as HTMLElement;
        expect(overlay.style.opacity).toBe('0');
    });

    it('should show opacity after trigger', () => {
        flash.trigger();
        flash.update();
        const overlay = container.querySelector('#damage-flash') as HTMLElement;
        expect(parseFloat(overlay.style.opacity)).toBeGreaterThan(0);
    });

    it('should decay opacity over time', () => {
        flash.trigger();
        // Run updates to let it decay
        for (let i = 0; i < 100; i++) {
            flash.update();
        }
        const overlay = container.querySelector('#damage-flash') as HTMLElement;
        expect(parseFloat(overlay.style.opacity)).toBe(0);
    });

    it('should not throw without init', () => {
        const uninitFlash = new DamageFlash();
        uninitFlash.trigger();
        expect(() => uninitFlash.update()).not.toThrow();
    });
});
