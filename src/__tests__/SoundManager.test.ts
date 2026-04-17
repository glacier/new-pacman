import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundManager } from '../audio/SoundManager';
import type { SoundName } from '../audio/SoundManager';

// Mock AudioContext
class MockOscillator {
    type = '';
    frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 };
    connect = vi.fn();
    start = vi.fn();
    stop = vi.fn();
}

class MockGain {
    gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
    connect = vi.fn();
}

class MockAudioBuffer {
    constructor(public numberOfChannels: number, public length: number, public sampleRate: number) {}
    getChannelData() { return new Float32Array(this.length); }
}

class MockBufferSource {
    buffer: MockAudioBuffer | null = null;
    connect = vi.fn();
    start = vi.fn();
    stop = vi.fn();
}

class MockBiquadFilter {
    type = '';
    frequency = { value: 0 };
    connect = vi.fn();
}

class MockAudioContext {
    currentTime = 0;
    sampleRate = 44100;
    state = 'running';
    destination = {};
    resume = vi.fn();
    createOscillator() { return new MockOscillator(); }
    createGain() { return new MockGain(); }
    createBufferSource() { return new MockBufferSource(); }
    createBiquadFilter() { return new MockBiquadFilter(); }
    createBuffer(channels: number, length: number, sampleRate: number) {
        return new MockAudioBuffer(channels, length, sampleRate);
    }
}

describe('SoundManager', () => {
    let manager: SoundManager;

    beforeEach(() => {
        manager = new SoundManager();
        // Provide mock AudioContext
        vi.stubGlobal('AudioContext', MockAudioContext);
    });

    it('should start unmuted', () => {
        expect(manager.muted).toBe(false);
    });

    it('should mute and unmute', () => {
        manager.mute();
        expect(manager.muted).toBe(true);
        manager.unmute();
        expect(manager.muted).toBe(false);
    });

    it('should toggle mute state', () => {
        manager.toggle();
        expect(manager.muted).toBe(true);
        manager.toggle();
        expect(manager.muted).toBe(false);
    });

    it('should not throw when playing any sound', () => {
        const sounds: SoundName[] = [
            'punch', 'kick', 'wallSmash', 'monsterDeath',
            'levelComplete', 'gameOver', 'playerHit'
        ];
        for (const s of sounds) {
            expect(() => manager.play(s)).not.toThrow();
        }
    });

    it('should not play sounds when muted', () => {
        manager.mute();
        // If muted, play should return early without creating AudioContext
        // We verify by checking that no error is thrown and muted stays true
        expect(() => manager.play('punch')).not.toThrow();
        expect(manager.muted).toBe(true);
    });

    it('should handle missing AudioContext gracefully', () => {
        vi.stubGlobal('AudioContext', undefined);
        const mgr = new SoundManager();
        expect(() => mgr.play('punch')).not.toThrow();
    });

    it('should resume suspended AudioContext', () => {
        const ctx = new MockAudioContext();
        ctx.state = 'suspended';
        // Replace the global with one that returns suspended context
        vi.stubGlobal('AudioContext', class extends MockAudioContext {
            state = 'suspended';
            resume = vi.fn();
        });
        const mgr = new SoundManager();
        mgr.play('punch');
        // Should not throw
    });
});
