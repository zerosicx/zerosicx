/**
 * ComputerPanel
 * Retro terminal overlay with a staggered boot sequence.
 * Styled with Tailwind CSS — dark bg, monospace, phosphor-glow aesthetic.
 */
export class ComputerPanel {
  private backdrop: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private onCloseCallback: (() => void) | null = null;
  private bootTimers: ReturnType<typeof setTimeout>[] = [];
  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  show(onClose?: () => void) {
    if (this.panel) return;
    this.onCloseCallback = onClose ?? null;

    const app = document.getElementById('app');
    if (!app) return;

    this.backdrop = document.createElement('div');
    this.backdrop.className = [
      'fixed', 'inset-0', 'bg-black/50', 'z-50',
    ].join(' ');
    this.backdrop.addEventListener('click', () => this.hide());

    this.panel = document.createElement('div');
    this.panel.className = [
      'fixed', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2',
      'w-[480px]', 'max-w-[calc(100%-2rem)]', 'max-h-[360px]',
      'bg-gray-950', 'border-2', 'border-gray-700',
      'rounded-md',
      'z-50',
      'shadow-2xl', 'shadow-green-900/30',
      'flex', 'flex-col',
      'overflow-hidden',
      'font-mono',
    ].join(' ');
    this.panel.addEventListener('click', (e) => e.stopPropagation());

    this.panel.innerHTML = `
      <div class="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border-b border-gray-700">
        <button id="terminal-close" class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer border-0" aria-label="Close"></button>
        <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
        <span class="w-3 h-3 rounded-full bg-green-500"></span>
        <span class="ml-auto text-xs text-gray-500">zerosicx_terminal</span>
      </div>

      <div id="terminal-body" class="flex-1 overflow-y-auto p-4 text-sm text-green-300 leading-relaxed">
        <p id="terminal-cursor" class="animate-pulse">>&nbsp;_</p>
      </div>

      <div class="px-4 pb-3">
        <p class="text-xs text-gray-600 italic">
          Full project list coming in v2. Check back soon 🌱
        </p>
      </div>
    `;

    app.appendChild(this.backdrop);
    app.appendChild(this.panel);

    document.getElementById('terminal-close')?.addEventListener('click', () => this.hide());

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.hide();
    };
    document.addEventListener('keydown', this.escHandler);

    this.runBootSequence();
  }

  hide() {
    for (const t of this.bootTimers) clearTimeout(t);
    this.bootTimers = [];

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }

    this.backdrop?.remove();
    this.panel?.remove();
    this.backdrop = null;
    this.panel = null;
    this.onCloseCallback?.();
    this.onCloseCallback = null;
  }

  private runBootSequence() {
    const lines = [
      '> loading zerosicx...',
      '> projects directory found.',
      '> 1 project loaded.',
      '>',
      '> [zerosicx] — pixel-art personal website (active)',
      '> more projects coming soon...',
      '>',
      "> type 'help' for commands. (just kidding, I'm just a div.)",
    ];

    const body = document.getElementById('terminal-body');
    const cursor = document.getElementById('terminal-cursor');
    if (!body || !cursor) return;

    lines.forEach((line, i) => {
      const timer = setTimeout(() => {
        const p = document.createElement('p');
        if (line === '>') {
          p.innerHTML = '&nbsp;';
        } else {
          p.textContent = line;
        }
        body.insertBefore(p, cursor);
        body.scrollTop = body.scrollHeight;
      }, (i + 1) * 120);
      this.bootTimers.push(timer);
    });
  }
}
