import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { loadArticles, Article } from '../data/content-loader';
import { ArticlePanel } from '../ui/ArticlePanel';

const FLOWER_EMOJIS: Record<string, string> = {
  learning:    '\u{1F338}', // 🌸
  programming: '\u{1F33B}', // 🌻
  design:      '\u{1F33A}', // 🌺
  thoughts:    '\u{1F337}', // 🌷
  life:        '\u{1F33C}', // 🌼
  tools:       '\u{1F331}', // 🌱
  reading:     '\u{1F4D6}', // 📖 (special case)
};
const DEFAULT_FLOWER = '\u{1F33C}'; // 🌼

const DOOR_Y_THRESHOLD = 22; // walk north past this → bedroom
const PROXIMITY = 28;
const GARDEN_ENTRY_Y = 28; // spawn from bedroom near top garden door

/**
 * GardenScene
 * Blog section. Each article = one flower.
 * Walking close to a flower previews the article in a right-side HTML panel.
 */
export class GardenScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private controller!: PlayerController;
  private dialogue!: DialogueSystem;
  private articlePanel!: ArticlePanel;
  private articles: Article[] = [];
  private flowerObjects: { text: Phaser.GameObjects.Text; article: Article }[] = [];
  private lastNearArticle: Article | null = null;

  constructor() {
    super({ key: 'GardenScene' });
  }

  async create(data?: { from?: 'bedroom' }) {
    this.articlePanel = new ArticlePanel();
    this.dialogue = new DialogueSystem();
    this.articles = [];
    this.flowerObjects = [];
    this.lastNearArticle = null;

    this.drawGarden();

    const spawnY = data?.from === 'bedroom' ? GARDEN_ENTRY_Y : GARDEN_ENTRY_Y;
    this.player = this.add.rectangle(160, spawnY, 12, 16, 0xff90c0);
    this.controller = new PlayerController(this, this.player);

    this.input.keyboard?.on('keydown-SPACE', () => this.tryInteractSignpost());
    this.input.keyboard?.on('keydown-ENTER', () => this.tryInteractSignpost());

    try {
      this.articles = await loadArticles();
    } catch (error) {
      console.error('?? Failed to load articles for garden:', error);
    }

    this.placeFlowers();
  }

  update() {
    if (!this.controller || !this.player) return;
    this.controller.update();

    // Return to bedroom
    if (this.player.y <= DOOR_Y_THRESHOLD) {
      this.articlePanel.hide();
      this.scene.start('BedroomScene', { from: 'garden' });
    }

    // Proximity article preview
    this.updateProximityPanel();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private drawGarden() {
    // Soft green floor
    this.add.rectangle(160, 120, 320, 240, 0xd1fae5);

    // Sandy path up the middle
    this.add.rectangle(160, 150, 24, 200, 0xfef3c7);

    // Return door at north
    this.add.rectangle(160, 4, 40, 8, 0xa78bfa);

    // Signpost near entrance
    this.add.rectangle(70, 55, 8, 24, 0x92400e); // post
    this.add.rectangle(80, 48, 24, 12, 0xd97706); // sign board
    this.add.text(68, 43, '\u{1F4CB}', { fontSize: '8px' }); // 📋

    // Garden border shrubs (placeholder)
    this.add.rectangle(160, 236, 320, 8, 0x86efac); // bottom shrubs
    this.add.rectangle(4, 120, 8, 240, 0x86efac);   // left shrubs
    this.add.rectangle(316, 120, 8, 240, 0x86efac); // right shrubs

    // Dev label
    this.add.text(4, 226, 'garden \u2014 phase 1 placeholder', {
      fontSize: '5px',
      color: '#6ee7b7',
      resolution: 3,
    });
  }

  private placeFlowers() {
    this.articles.forEach((article, i) => {
      // Spread flowers into left and right patches, skip the centre path
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const x = 160 + side * (40 + (i % 3) * 16);
      const y = 80 + row * 30;

      const emoji = FLOWER_EMOJIS[article.tags[0]] ?? DEFAULT_FLOWER;
      const flowerText = this.add.text(x, y, emoji, { fontSize: '12px', resolution: 3 })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.articlePanel.show(article));

      this.flowerObjects.push({ text: flowerText, article });
    });
  }

  private updateProximityPanel() {
    const px = this.player.x;
    const py = this.player.y;

    let nearest: { text: Phaser.GameObjects.Text; article: Article } | null = null;
    let nearestDist = Infinity;

    for (const f of this.flowerObjects) {
      const dist = Phaser.Math.Distance.Between(px, py, f.text.x, f.text.y);
      if (dist < PROXIMITY && dist < nearestDist) {
        nearest = f;
        nearestDist = dist;
      }
    }

    if (nearest && nearest.article !== this.lastNearArticle) {
      this.lastNearArticle = nearest.article;
      this.articlePanel.showPreview(nearest.article);
    } else if (!nearest && this.lastNearArticle) {
      this.lastNearArticle = null;
      this.articlePanel.hide();
    }
  }

  private tryInteractSignpost() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 70, 55);
    if (dist < 32) {
      this.articlePanel.showRecent(this.articles.slice(0, 5));
    }
  }
}
