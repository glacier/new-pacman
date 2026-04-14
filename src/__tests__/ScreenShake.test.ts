import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenShake } from '../effects/ScreenShake';

describe('ScreenShake', () => {
    let shake: ScreenShake;
    let container: HTMLDivElement;

    beforeEach(() => {
        shake = new ScreenShake();
        container = document.createElement('div');
        shake.init(container);
    });

    it('should start with no shake', () => {
        shake.update();
        expect(container.style.transform).toBe('');
    });

    it('should apply transform on trigger', () => {
        shake.trigger(10);
        shake.update();
        expect(container.style.transform).not.toBe('');
        expect(container.style.transform).toContain('translate');
    });

    it('should decay to zero over time', () => {
        shake.trigger(5);

        // Run many update cycles to let it decay
        for (let i = 0; i < 100; i++) {
            shake.update();
        }

        // After enough decay, transform should reset
        expect(container.style.transform).toBe('');
    });

    it('should take the maximum of current and new intensity', () => {
        shake.trigger(3);
        shake.trigger(8);
        // The second trigger should keep the higher intensity
        shake.update();
        expect(container.style.transform).toContain('translate');
    });

    it('should do nothing without init', () => {
        const uninitShake = new ScreenShake();
        uninitShake.trigger(10);
        expect(() => uninitShake.update()).not.toThrow();
    });
});
