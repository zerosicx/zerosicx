import { Article } from '../data/content-loader';

/**
 * ArticlePanel
 * HTML overlay panel (right-side) for showing article previews and full reads.
 * Pixel-art styled: 3-colour palette (parchment, dark brown, accent pink),
 * hard borders, offset shadow.
 */
export class ArticlePanel {
  private panel: HTMLElement | null = null;

  showPreview(article: Article) {
    this.render(`
      <div class="flex flex-col gap-2">
        <p class="text-sm text-[#c2506a] uppercase tracking-widest font-bold">
          ${article.tags.join(' \u00b7 ')}
        </p>
        <h2 class="text-lg font-bold text-[#2d1b0e] leading-snug">
          ${article.title}
        </h2>
        <p class="text-sm text-[#7a5c3e]">
          ${article.date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div class="text-base text-[#4a3728] line-clamp-4 mt-1 leading-relaxed">
          ${article.body}
        </div>
        <button
          id="read-more-btn"
          class="mt-3 text-base text-[#c2506a] hover:text-[#a03050] font-bold text-left cursor-pointer"
        >
          Read more \u2192
        </button>
      </div>
    `);

    document.getElementById('read-more-btn')?.addEventListener('click', () => {
      this.show(article);
    });
  }

  show(article: Article) {
    this.render(`
      <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm text-[#c2506a] uppercase tracking-widest font-bold mb-1">
              ${article.tags.join(' \u00b7 ')}
            </p>
            <h2 class="text-xl font-bold text-[#2d1b0e] leading-snug">
              ${article.title}
            </h2>
            <p class="text-sm text-[#7a5c3e] mt-0.5">
              ${article.date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button id="close-panel-btn"
            class="text-[#4a3728] hover:text-[#2d1b0e] text-lg leading-none cursor-pointer flex-shrink-0 font-bold"
            aria-label="Close"
          >\u2715</button>
        </div>

        <div class="border-t-2 border-[#8a3a5e]/40 my-1"></div>

        <div
          id="article-body"
          class="flex-1 overflow-y-auto text-base text-[#4a3728] leading-relaxed max-w-none"
        >
          ${article.body}
        </div>

        ${article.references.length > 0 ? `
          <div class="border-t-2 border-[#8a3a5e]/40 pt-3">
            <p class="text-sm font-bold text-[#7a5c3e] mb-1">References</p>
            <ul class="text-sm text-[#c2506a] space-y-0.5">
              ${article.references.map(r => `
                <li>
                  <a href="${r.url}" target="_blank" rel="noopener"
                    class="hover:text-[#a03050]"
                  >${r.title}</a>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `);

    document.getElementById('close-panel-btn')?.addEventListener('click', () => this.hide());
  }

  showRecent(articles: Article[]) {
    this.render(`
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-[#2d1b0e] uppercase tracking-widest">
            Latest from the garden
          </h2>
          <button id="close-panel-btn"
            class="text-[#4a3728] hover:text-[#2d1b0e] cursor-pointer font-bold"
          >\u2715</button>
        </div>
        <ul class="flex flex-col gap-3">
          ${articles.map(a => `
            <li class="border-b-2 border-[#4a3728]/30 pb-3">
              <p class="text-sm text-[#7a5c3e]">${a.date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</p>
              <button
                class="text-base font-bold text-[#2d1b0e] hover:text-[#c2506a] text-left cursor-pointer article-link"
                data-slug="${a.slug}"
              >${a.title}</button>
              <p class="text-sm text-[#7a5c3e] mt-0.5">${a.tags.join(', ')}</p>
            </li>
          `).join('')}
        </ul>
      </div>
    `);

    document.getElementById('close-panel-btn')?.addEventListener('click', () => this.hide());
    document.querySelectorAll('.article-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = (btn as HTMLElement).dataset.slug;
        const article = articles.find(a => a.slug === slug);
        if (article) this.show(article);
      });
    });
  }

  hide() {
    this.panel?.remove();
    this.panel = null;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private render(html: string) {
    if (!this.panel) this.createPanel();
    if (this.panel) this.panel.innerHTML = html;
  }

  private createPanel() {
    const app = document.getElementById('app');
    if (!app) return;

    this.panel = document.createElement('div');
    this.panel.id = 'article-panel';
    this.panel.className = [
      'fixed', 'top-4', 'right-4', 'bottom-4',
      'w-96',
      'bg-[#fef3e2]',
      'border-4', 'border-[#a8607e]',
      'p-5',
      'z-40',
      'overflow-y-auto',
      'shadow-[4px_4px_0_#8a4a68]',
    ].join(' ');

    app.appendChild(this.panel);
  }
}
