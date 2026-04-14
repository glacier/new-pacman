interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        radius: 2 + Math.random() * 4,
        color,
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  get count(): number {
    return this.particles.length;
  }
}

export class DamageFlash {
  private overlay: HTMLElement | null = null;
  private opacity: number = 0;

  init(container: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.id = 'damage-flash';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: red;
      opacity: 0;
      pointer-events: none;
      z-index: 50;
      transition: opacity 0.1s;
    `;
    container.appendChild(this.overlay);
  }

  trigger() {
    this.opacity = 0.4;
  }

  update() {
    if (this.opacity > 0) {
      this.opacity *= 0.85;
      if (this.opacity < 0.01) this.opacity = 0;
    }
    if (this.overlay) {
      this.overlay.style.opacity = String(this.opacity);
    }
  }
}

export const particles = new ParticleSystem();
export const damageFlash = new DamageFlash();
