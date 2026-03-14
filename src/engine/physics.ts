import { Engine, Render, World, Bodies, Runner } from 'matter-js';

export class PhysicsSetup {
    public engine: Engine;
    public world: World;
    public runner: Runner;
    public render?: Render;

    constructor() {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.world.gravity.y = 0; 
        this.runner = Runner.create();
    }

    init(canvas: HTMLCanvasElement) {
        this.render = Render.create({
            canvas: canvas,
            engine: this.engine,
            options: {
                width: 960,
                height: 640,
                background: 'transparent',
                wireframes: false,
                showAngleIndicator: false
            }
        });

        Render.run(this.render);
        Runner.run(this.runner, this.engine);

        // Ensure transparency and set background programmatically
        canvas.style.background = 'url("/grass.png")';
        canvas.style.backgroundSize = '64px 64px';
        canvas.style.backgroundRepeat = 'repeat';
        canvas.style.backgroundColor = '#228b22'; // Fallback
    }

    addStaticBody(x: number, y: number, width: number, height: number, options: Matter.IBodyDefinition = {}) {
        const body = Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            friction: 0.1,
            render: { fillStyle: '#2d2d34' },
            ...options
        } as Matter.IChamferableBodyDefinition);
        World.add(this.world, body);
        return body;
    }

    addDynamicBody(x: number, y: number, width: number, height: number, options: Matter.IBodyDefinition = {}) {
        const body = Bodies.rectangle(x, y, width, height, {
            friction: 0.1,
            restitution: 0.2, 
            ...options
        } as Matter.IChamferableBodyDefinition);
        World.add(this.world, body);
        return body;
    }

    removeBody(body: Matter.Body) {
        World.remove(this.world, body);
    }
}

export const physics = new PhysicsSetup();
