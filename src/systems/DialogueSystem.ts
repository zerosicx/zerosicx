/**
 * DialogueSystem
 * Manages the Pokemon-style dialogue box rendered as an HTML overlay
 * (positioned over the Phaser canvas). Styled with Tailwind CSS.
 */
export class DialogueSystem {
  private wrapper: HTMLElement | null = null;
  private box: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private currentText = '';
  private typingInterval: ReturnType<typeof setInterval> | null = null;
  private _isTyping = false;

  show(text: string) {
    if (!this.wrapper) this.createBox();
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
    this.wrapper?.remove();
    this.wrapper = null;
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

    this.wrapper = document.createElement('div');
    this.wrapper.id = 'dialogue-box';
    this.wrapper.className = [
      'fixed', 'bottom-10', 'left-1/2', '-translate-x-1/2',
      'w-[calc(100%-2rem)]', 'max-w-2xl',
      'z-50', 'select-none', 'pointer-events-none',
      'flex', 'items-end', 'gap-0',
    ].join(' ');

    // Character portrait — waist-up crop
    const portraitFrame = document.createElement('div');
    portraitFrame.className = 'w-44 h-36 overflow-hidden flex-shrink-0 -mr-1';
    const portrait = document.createElement('img');
    portrait.src = '/assets/sprites/character.png';
    portrait.alt = 'Hannah';
    portrait.className = 'w-44';
    portrait.style.imageRendering = 'pixelated';
    portrait.style.marginTop = '-10px';
    portraitFrame.appendChild(portrait);

    this.box = document.createElement('div');
    this.box.className = [
      'flex-1',
      'bg-[#fef3e2]', 'border-4', 'border-[#4a3728]',
      'px-5', 'py-4',
      'shadow-[4px_4px_0_#4a3728]',
    ].join(' ');

    const name = document.createElement('p');
    name.className = 'text-sm font-bold text-[#c2506a] mb-1.5 tracking-wide uppercase';
    name.textContent = 'Hannah';

    this.textEl = document.createElement('p');
    this.textEl.className = 'min-h-[2em] leading-relaxed text-lg text-[#2d1b0e]';

    const hint = document.createElement('p');
    hint.className = 'text-right text-xs text-[#c2506a] mt-2 animate-pulse';
    hint.textContent = '\u25BC SPACE to continue';

    this.box.appendChild(name);
    this.box.appendChild(this.textEl);
    this.box.appendChild(hint);
    this.wrapper.appendChild(portraitFrame);
    this.wrapper.appendChild(this.box);
    app.appendChild(this.wrapper);
  }

  private clearTyping() {
    if (this.typingInterval !== null) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }
}
