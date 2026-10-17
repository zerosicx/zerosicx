import { isTouchDevice } from './Gamepad';

/** Who's talking: the name above the text and the sprite beside the box. */
export type Speaker = { name: string; portrait: string };

/** Portraits are front-facing sprites cropped by `npm run sprites`. */
export const SPEAKERS = {
  hannah: { name: 'Hannah', portrait: '/assets/sprites/sakura/host-portrait.png' },
  mitchy: { name: 'Mitchy', portrait: '/assets/sprites/sakura/mitchy-portrait.png' },
} satisfies Record<string, Speaker>;

/**
 * DialogueSystem
 * Manages the Pokemon-style dialogue box rendered as an HTML overlay
 * (positioned over the Phaser canvas). Styled with Tailwind CSS.
 */
export class DialogueSystem {
  private wrapper: HTMLElement | null = null;
  private box: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;
  private nameEl: HTMLElement | null = null;
  private portraitEl: HTMLImageElement | null = null;
  private currentText = '';
  private typingInterval: ReturnType<typeof setInterval> | null = null;
  private _isTyping = false;

  show(text: string, speaker: Speaker = SPEAKERS.hannah) {
    if (!this.wrapper) this.createBox();
    this.clearTyping();
    if (this.nameEl) this.nameEl.textContent = speaker.name;
    if (this.portraitEl && !this.portraitEl.src.endsWith(speaker.portrait)) {
      this.portraitEl.alt = speaker.name;
      this.portraitEl.src = speaker.portrait;
    }

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
    this.nameEl = null;
    this.portraitEl = null;
  }

  isTyping(): boolean {
    return this._isTyping;
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private createBox() {
    // Inside #screen: on phones the CSS docks it to the bottom of the game
    // screen; on desktop it stays fixed to the bottom of the window.
    const app = document.getElementById('screen') ?? document.getElementById('app');
    if (!app) return;

    this.wrapper = document.createElement('div');
    this.wrapper.id = 'dialogue-box';
    this.wrapper.className = [
      'fixed', 'bottom-10', 'left-1/2', '-translate-x-1/2',
      'w-[calc(100%-2rem)]', 'max-w-2xl',
      'z-50', 'select-none', 'pointer-events-none',
      'flex', 'items-end', 'gap-0',
    ].join(' ');

    // Speaker portrait: their front-facing sprite at an exact 3×, so the
    // pixels stay crisp. The src is set by show().
    const portraitFrame = document.createElement('div');
    portraitFrame.className = 'w-44 h-36 flex-shrink-0 -mr-1 flex items-end justify-center pb-2';
    const portrait = document.createElement('img');
    portrait.style.imageRendering = 'pixelated';
    portrait.onload = () => { portrait.style.width = `${portrait.naturalWidth * 3}px`; };
    portraitFrame.appendChild(portrait);
    this.portraitEl = portrait;

    this.box = document.createElement('div');
    this.box.className = [
      'flex-1',
      'bg-[#fef3e2]', 'border-4', 'border-[#4a3728]',
      'px-5', 'py-4',
      'shadow-[4px_4px_0_#4a3728]',
    ].join(' ');

    const name = document.createElement('p');
    name.className = 'text-sm font-bold text-[#c2506a] mb-1.5 tracking-wide uppercase';
    this.nameEl = name;

    this.textEl = document.createElement('p');
    this.textEl.className = 'min-h-[2em] leading-relaxed text-lg text-[#2d1b0e]';

    const hint = document.createElement('p');
    hint.className = 'text-right text-xs text-[#c2506a] mt-2 animate-pulse';
    hint.textContent = isTouchDevice() ? '\u25BC A to continue \u00B7 B to leave' : '\u25BC SPACE to continue \u00B7 ESC to leave';

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
