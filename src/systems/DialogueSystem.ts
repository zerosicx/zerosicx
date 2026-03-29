/**
 * DialogueSystem
 * Manages the Pokemon-style dialogue box rendered as an HTML overlay
 * (positioned over the Phaser canvas). Styled with Tailwind CSS.
 */
export class DialogueSystem {
  private box: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private currentText = '';
  private typingInterval: ReturnType<typeof setInterval> | null = null;
  private _isTyping = false;

  show(text: string) {
    if (!this.box) this.createBox();
    this.clearTyping();

    this.currentText = text;
    this._isTyping = true;
    if (this.textEl) this.textEl.textContent = '';

    let i = 0;
    this.typingInterval = setInterval(() => {
      if (!this.textEl) return;
      this.textEl.textContent += text[i];
      i++;
      if (i >= text.length) {
        this._isTyping = false;
        this.clearTyping();
      }
    }, 28);
  }

  skipTyping() {
    if (!this._isTyping) return;
    this.clearTyping();
    if (this.textEl) this.textEl.textContent = this.currentText;
    this._isTyping = false;
  }

  hide() {
    this.clearTyping();
    this.box?.remove();
    this.box = null;
    this.textEl = null;
  }

  isTyping(): boolean {
    return this._isTyping;
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private createBox() {
    const app = document.getElementById('app');
    if (!app) return;

    this.box = document.createElement('div');
    this.box.id = 'dialogue-box';
    // Tailwind classes for the box
    this.box.className = [
      'fixed', 'bottom-4', 'left-1/2', '-translate-x-1/2',
      'w-[calc(100%-2rem)]', 'max-w-2xl',
      'bg-pink-50', 'border-4', 'border-gray-900',
      'rounded-none',           // crisp pixel-art corners
      'px-6', 'py-4',
      'z-50',
      'shadow-[4px_4px_0_#1a0a1a]',
      'select-none',
      'pointer-events-none',    // let clicks pass through to the game
    ].join(' ');

    this.textEl = document.createElement('p');
    this.textEl.className = 'min-h-[3em] leading-relaxed text-sm text-gray-900 tracking-wide';

    const hint = document.createElement('p');
    hint.className = 'text-right text-xs text-pink-400 mt-2 animate-pulse';
    hint.textContent = '\u25BC SPACE to continue';

    this.box.appendChild(this.textEl);
    this.box.appendChild(hint);
    app.appendChild(this.box);
  }

  private clearTyping() {
    if (this.typingInterval !== null) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }
}
