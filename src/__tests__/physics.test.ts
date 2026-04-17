import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Engine, Render, World, Bodies, Runner } from 'matter-js';
import { PhysicsSetup } from '../engine/physics';

vi.mock('matter-js', () => {
    return {
        Engine: {
            create: vi.fn(() => ({
                world: {
                    gravity: { y: 0 }
                }
            }))
        },
        Render: {
            create: vi.fn(() => ({})),
            run: vi.fn()
        },
        World: {
            add: vi.fn(),
            remove: vi.fn()
        },
        Bodies: {
            rectangle: vi.fn((x, y, w, h, options) => ({ x, y, w, h, ...options }))
        },
        Runner: {
            create: vi.fn(() => ({})),
            run: vi.fn()
        }
    };
});

describe('PhysicsSetup', () => {
    let physics: PhysicsSetup;

    beforeEach(() => {
        vi.clearAllMocks();
        physics = new PhysicsSetup();
    });

    it('should initialize engine, world, and runner in constructor', () => {
        expect(Engine.create).toHaveBeenCalled();
        expect(Runner.create).toHaveBeenCalled();
        expect(physics.engine).toBeDefined();
        expect(physics.world).toBeDefined();
        expect(physics.runner).toBeDefined();
        expect(physics.world.gravity.y).toBe(0);
    });

    it('should initialize render and run it in init', () => {
        const mockCanvas = document.createElement('canvas');
        physics.init(mockCanvas);

        expect(Render.create).toHaveBeenCalledWith(expect.objectContaining({
            canvas: mockCanvas,
            engine: physics.engine
        }));
        expect(Render.run).toHaveBeenCalled();
        expect(Runner.run).toHaveBeenCalledWith(physics.runner, physics.engine);
        expect(mockCanvas.style.backgroundSize).toBe('64px 64px');
    });

    it('should add a static body', () => {
        const body = physics.addStaticBody(100, 200, 50, 50);

        expect(Bodies.rectangle).toHaveBeenCalledWith(100, 200, 50, 50, expect.objectContaining({
            isStatic: true
        }));
        expect(World.add).toHaveBeenCalledWith(physics.world, body);
        expect(body).toBeDefined();
    });

    it('should add a dynamic body', () => {
        const body = physics.addDynamicBody(300, 400, 30, 30);

        expect(Bodies.rectangle).toHaveBeenCalledWith(300, 400, 30, 30, expect.objectContaining({
            isStatic: undefined
        }));
        expect(World.add).toHaveBeenCalledWith(physics.world, body);
        expect(body).toBeDefined();
    });

    it('should remove a body', () => {
        const mockBody = { id: 1 } as any;
        physics.removeBody(mockBody);
        expect(World.remove).toHaveBeenCalledWith(physics.world, mockBody);
    });
});
