import { Article } from '../data/content-loader';

/**
 * ArticlePanel
 * HTML overlay panel (right-side) for showing article previews and full reads.
 * Styled with Tailwind CSS. Completely separate from the Phaser canvas.
 */
export class ArticlePanel {
  private panel: HTMLElement | null = null;

  /** Show a short preview (triggered by proximity to a flower) */
  showPreview(article: Article) {
    this.render(`
      <div class="flex flex-col gap-2">
        <p class="text-xs text-pink-400 uppercase tracking-widest">
          ${article.tags.join(' \u00b7 ')}
        </p>
        <h2 class="text-base font-semibold text-gray-900 leading-snug">
          ${article.title}
        </h2>
        <p class="text-xs text-gray-500">
          ${article.date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div class="text-sm text-gray-700 line-clamp-4 mt-1">
          ${article.body}
        </div>
        <button
          id="read-more-btn"
          class="mt-3 text-xs text-pink-500 hover:text-pink-700 underline underline-offset-2 text-left cursor-pointer"
        >
          Read more \u2192
        </button>
      </div>
    `);

    document.getElementById('read-more-btn')?.addEventListener('click', () => {
      this.show(article);
    });
  }

  /** Show the full article */
  show(article: Article) {
    this.render(`
      <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs text-pink-400 uppercase tracking-widest mb-1">
              ${article.tags.join(' \u00b7 ')}
            </p>
            <h2 class="text-lg font-semibold text-gray-900 leading-snug">
              ${article.title}
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              ${article.date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button id="close-panel-btn"
            class="text-gray-400 hover:text-gray-700 text-lg leading-none cursor-pointer flex-shrink-0"
            aria-label="Close"
          >\u2715</button>
        </div>

        <div
          id="article-body"
          class="flex-1 overflow-y-auto text-sm text-gray-800 leading-relaxed prose prose-sm prose-pink max-w-none"
        >
          ${article.body}
        </div>

        ${article.references.length > 0 ? `
          <div class="border-t border-pink-100 pt-3">
            <p class="text-xs font-medium text-gray-500 mb-1">References</p>
            <ul class="text-xs text-pink-500 space-y-0.5">
              ${article.references.map(r => `
                <li>
                  <a href="${r.url}" target="_blank" rel="noopener"
                    class="hover:underline"
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

  /** Show a list of recent articles (triggered by signpost) */
  showRecent(articles: Article[]) {
    this.render(`
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-widest">
            \u{1F333} Latest from the garden
          </h2>
          <button id="close-panel-btn"
            class="text-gray-400 hover:text-gray-700 cursor-pointer"
          >\u2715</button>
        </div>
        <ul class="flex flex-col gap-3">
          ${articles.map(a => `
            <li class="border-b border-pink-100 pb-3">
              <p class="text-xs text-pink-400">${a.date.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</p>
              <button
                class="text-sm font-medium text-gray-900 hover:text-pink-600 text-left cursor-pointer article-link"
                data-slug="${a.slug}"
              >${a.title}</button>
              <p class="text-xs text-gray-500 mt-0.5">${a.tags.join(', ')}</p>
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
      'w-80',
      'bg-white/95', 'backdrop-blur-sm',
      'border-2', 'border-pink-200',
      'rounded-sm',
      'p-5',
      'z-40',
      'overflow-y-auto',
      'shadow-xl',
    ].join(' ');

    app.appendChild(this.panel);
  }
}
