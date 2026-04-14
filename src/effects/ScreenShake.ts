export class ScreenShake {
  private intensity: number = 0;
  private decay: number = 0.9;
  private container: HTMLElement | null = null;

  init(container: HTMLElement) {
    this.container = container;
  }

  trigger(intensity: number) {
    this.intensity = Math.max(this.intensity, intensity);
  }

  update() {
    if (!this.container) return;

    if (this.intensity > 0.5) {
      const offsetX = (Math.random() - 0.5) * this.intensity * 2;
      const offsetY = (Math.random() - 0.5) * this.intensity * 2;
      this.container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      this.intensity *= this.decay;
    } else {
      this.intensity = 0;
      this.container.style.transform = '';
    }
  }
}

export const screenShake = new ScreenShake();
