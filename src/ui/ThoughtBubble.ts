/**
 * ThoughtBubble
 * A small HTML thought bubble that floats above a sprite. It ignores the
 * pointer and never takes focus, so it can't interrupt the player.
 */
export class ThoughtBubble {
  private el: HTMLDivElement;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'thought-bubble';
    this.el.setAttribute('aria-live', 'polite');
    document.getElementById('app')?.appendChild(this.el);
  }

  get visible() {
    return this.el.classList.contains('is-visible');
  }

  show(text: string, durationMs = 4500) {
    this.el.textContent = text;
    this.el.classList.add('is-visible');
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), durationMs);
  }

  hide() {
    this.el.classList.remove('is-visible');
  }

  /** Anchor the bubble's tail to a point in game coordinates. */
  place(canvas: HTMLCanvasElement, gameWidth: number, x: number, y: number) {
    const scale = canvas.clientWidth / gameWidth;
    this.el.classList.toggle('is-flipped', x > gameWidth * 0.6); // keep it inside the room
    this.el.style.left = `${canvas.offsetLeft + x * scale}px`;
    this.el.style.top = `${canvas.offsetTop + y * scale}px`;
  }

  destroy() {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.el.remove();
  }
}
