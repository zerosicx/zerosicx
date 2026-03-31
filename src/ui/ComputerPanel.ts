import { Project } from '../data/content-loader';

/**
 * ComputerPanel
 * Retro terminal overlay with a staggered boot sequence.
 * Lists real projects loaded from content/projects/.
 */
export class ComputerPanel {
  private backdrop: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private onCloseCallback: (() => void) | null = null;
  private bootTimers: ReturnType<typeof setTimeout>[] = [];
  private escHandler: ((e: KeyboardEvent) => void) | null = null;
  private currentProjects: Project[] = [];

  show(projects: Project[], onClose?: () => void) {
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
      'w-[640px]', 'max-w-[calc(100%-2rem)]', 'max-h-[520px]',
      'bg-[#0a1208]', 'border-4', 'border-[#2a4a20]',
      'z-50',
      'shadow-[4px_4px_0_#1a3010]',
      'flex', 'flex-col',
      'overflow-hidden',
    ].join(' ');
    this.panel.style.fontFamily = "'Pixelify Sans', cursive";
    this.panel.addEventListener('click', (e) => e.stopPropagation());

    this.panel.innerHTML = `
      <div class="flex items-center gap-1.5 px-4 py-2.5 bg-[#0d1a0a] border-b-2 border-[#2a4a20]">
        <button id="terminal-close" class="w-3.5 h-3.5 bg-[#c2506a] hover:bg-[#d4627a] cursor-pointer border-0" aria-label="Close"></button>
        <span class="w-3.5 h-3.5 bg-[#d4a32a]"></span>
        <span class="w-3.5 h-3.5 bg-[#3a8a3a]"></span>
        <span class="ml-auto text-sm text-[#2a4a20] font-bold">zerosicx_terminal</span>
      </div>

      <div id="terminal-body" class="flex-1 overflow-y-auto p-5 text-base text-green-300 leading-relaxed">
        <p id="terminal-cursor" class="animate-pulse text-lg">>&nbsp;_</p>
      </div>
    `;

    app.appendChild(this.backdrop);
    app.appendChild(this.panel);

    document.getElementById('terminal-close')?.addEventListener('click', () => this.hide());

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.hide();
    };
    document.addEventListener('keydown', this.escHandler);

    this.currentProjects = projects;
    this.runBootSequence(projects);
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

  private runBootSequence(projects: Project[]) {
    const statusIcon = (s: Project['status']) =>
      s === 'active' ? '\u{1F7E2}' : s === 'completed' ? '\u2705' : '\u{1F4E6}';

    const lines: { text: string; html?: string }[] = [
      { text: '> loading zerosicx...' },
      { text: '> projects directory found.' },
      { text: `> ${projects.length} project${projects.length !== 1 ? 's' : ''} loaded.` },
      { text: '' },
      ...projects.map(p => ({
        text: '',
        html: `<button class="project-btn text-left text-green-300 hover:text-green-100 cursor-pointer bg-transparent border-0 p-0 text-base" data-slug="${p.slug}" style="font-family:'Pixelify Sans',cursive">${statusIcon(p.status)} [${p.slug}] — ${p.description.slice(0, 60)}${p.description.length > 60 ? '...' : ''} <span class="text-gray-500">(${p.status})</span></button>`,
      })),
      { text: '' },
      { text: "> press Esc or click outside to close." },
    ];

    const body = document.getElementById('terminal-body');
    const cursor = document.getElementById('terminal-cursor');
    if (!body || !cursor) return;

    lines.forEach((line, i) => {
      const timer = setTimeout(() => {
        const p = document.createElement('p');
        if (line.html) {
          p.innerHTML = line.html;
        } else if (line.text === '') {
          p.innerHTML = '&nbsp;';
        } else {
          p.textContent = line.text;
        }
        body.insertBefore(p, cursor);
        body.scrollTop = body.scrollHeight;

        if (i === lines.length - 1) {
          cursor.style.display = 'none';
          this.wireProjectButtons(projects);
        }
      }, (i + 1) * 120);
      this.bootTimers.push(timer);
    });
  }

  private wireProjectButtons(projects: Project[]) {
    document.querySelectorAll('.project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = (btn as HTMLElement).dataset.slug;
        const project = projects.find(p => p.slug === slug);
        if (project) this.showProjectDetail(project);
      });
    });
  }

  private showProjectDetail(project: Project) {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const tags = project.tags.map(t => `<span class="text-cyan-400">#${t}</span>`).join(' ');
    const period = project.dateEnd === 'present'
      ? `${project.dateStart} — present`
      : `${project.dateStart} — ${project.dateEnd}`;

    body.innerHTML = `
      <button id="back-btn" class="text-green-500 hover:text-green-300 cursor-pointer bg-transparent border-0 p-0 text-base mb-3" style="font-family:'Pixelify Sans',cursive">&larr; back</button>
      <h3 class="text-green-100 text-xl font-bold mb-1">${project.title}</h3>
      <p class="text-gray-500 text-sm mb-2">${period}</p>
      <p class="text-sm mb-3">${tags}</p>
      <div class="text-green-300/90 text-base leading-relaxed">${project.body}</div>
    `;

    document.getElementById('back-btn')?.addEventListener('click', () => {
      body.innerHTML = '<p id="terminal-cursor" class="animate-pulse text-lg">>&nbsp;_</p>';
      this.runBootSequence(this.currentProjects);
    });
  }
}
