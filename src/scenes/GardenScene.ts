import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { loadArticles, Article } from '../data/content-loader';
import { ArticlePanel } from '../ui/ArticlePanel';

const DOOR_Y_THRESHOLD = 22;
const PROXIMITY = 28;
const GARDEN_ENTRY_Y = 28;

// ─── Tile grid constants ─────────────────────────────────────────────────────
const TILE = 16;
const COLS = 20; // 320 / 16
const ROWS = 15; // 240 / 16
const GRASS_COLS = 11; // Grass.png is 176px → 11 columns

// Grass frame indices (row * GRASS_COLS + col)
const G = {
  grass_top_left:     0 * GRASS_COLS + 0,
  grass_top:          0 * GRASS_COLS + 1,
  grass_top_right:    0 * GRASS_COLS + 2,
  grass_left:         1 * GRASS_COLS + 0,
  grass_middle:       1 * GRASS_COLS + 1,
  grass_right:        1 * GRASS_COLS + 2,
  grass_bottom_left:  2 * GRASS_COLS + 0,
  grass_bottom:       2 * GRASS_COLS + 1,
  grass_bottom_right: 2 * GRASS_COLS + 2,
  textures: [
    5 * GRASS_COLS + 0, 5 * GRASS_COLS + 1, 5 * GRASS_COLS + 2,
    5 * GRASS_COLS + 3, 5 * GRASS_COLS + 4, 5 * GRASS_COLS + 5,
    6 * GRASS_COLS + 0, 6 * GRASS_COLS + 1, 6 * GRASS_COLS + 2,
    6 * GRASS_COLS + 3, 6 * GRASS_COLS + 4, 6 * GRASS_COLS + 5,
  ],
} as const;

// Door frames
const D = {
  entrance_no_door: 0,
  door_closed:      1,
  door_open:        2,
  door_half_open:   3,
} as const;

const DOOR_COL = 10;
const DOOR_CENTER_X = DOOR_COL * TILE + TILE / 2;
const DOOR_ROW = 1;
const DOOR_CENTER_Y = DOOR_ROW * TILE + TILE / 2;
const DOOR_RANGE_FAR = 48;
const DOOR_RANGE_NEAR = 32;

// Fence frame indices (4 cols — number = connected edges)
const FENCE_COLS = 4;
const FE = {
  top_left_2:     0 * FENCE_COLS + 1,  // corner ┌
  top_right_2:    0 * FENCE_COLS + 3,  // corner ┐
  middle_1:       1 * FENCE_COLS + 0,  // vertical │
  bottom_left_2:  2 * FENCE_COLS + 1,  // corner └
  bottom_right_2: 2 * FENCE_COLS + 3,  // corner ┘
  middle_2:       3 * FENCE_COLS + 2,  // horizontal ─
} as const;

// GrassBiome frame indices (9 cols)
const GB_COLS = 9;
const GB = {
  red_mushroom:     0 * GB_COLS + 6,
  purple_mushroom:  0 * GB_COLS + 7,
  sprout:           1 * GB_COLS + 5,
  sproutlings:      1 * GB_COLS + 6,
  small_rock:       1 * GB_COLS + 7,
  sunflower_bud:    2 * GB_COLS + 6,
  small_sunflower:  2 * GB_COLS + 7,
  blue_flower:      3 * GB_COLS + 5,
  pink_flower_bud:  3 * GB_COLS + 6,
  pink_flower:      3 * GB_COLS + 7,
  rock:             4 * GB_COLS + 6,
} as const;

// Map article tag → grass-biome flower frame
const TAG_FLOWERS: Record<string, number> = {
  learning:    GB.small_sunflower,
  programming: GB.blue_flower,
  design:      GB.pink_flower,
  thoughts:    GB.pink_flower_bud,
  life:        GB.sunflower_bud,
  tools:       GB.sprout,
  reading:     GB.sproutlings,
};

// Chest frame indices (15 cols — 240px / 16)
const CHEST_COLS = 15;
const CH = {
  small_closed:    1 * CHEST_COLS + 1,
  small_half_open: 1 * CHEST_COLS + 7,
  small_open:      1 * CHEST_COLS + 10,
} as const;

/**
 * GardenScene
 * Blog section. Each article = one flower sprite.
 * Walking close to a flower shows the article in a right-side HTML panel.
 */
export class GardenScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private controller!: PlayerController;
  private dialogue!: DialogueSystem;
  private doorSprite!: Phaser.GameObjects.Image;
  private articlePanel!: ArticlePanel;
  private articles: Article[] = [];
  private flowerObjects: { sprite: Phaser.GameObjects.Image; article: Article }[] = [];
  private chestSprite!: Phaser.GameObjects.Image;
  private chestOpen = false;
  private lastNearArticle: Article | null = null;

  constructor() {
    super({ key: 'GardenScene' });
  }

  async create(data?: { from?: 'bedroom' }) {
    this.articlePanel = new ArticlePanel();
    this.dialogue = new DialogueSystem();
    const label = document.getElementById('scene-label');
    if (label) label.textContent = 'garden';
    this.articles = [];
    this.flowerObjects = [];
    this.lastNearArticle = null;

    this.drawGarden();

    const spawnY = data?.from === 'bedroom' ? GARDEN_ENTRY_Y : GARDEN_ENTRY_Y;
    this.player = this.add.sprite(160, spawnY, 'visitor', 0);
    this.controller = new PlayerController(this, this.player, {
      minX: 30, maxX: 286, minY: 18, maxY: 206,
    });


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

    // Animate door
    const doorDist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, DOOR_CENTER_X, DOOR_CENTER_Y,
    );
    if (doorDist < DOOR_RANGE_NEAR) {
      this.doorSprite.setFrame(D.door_open);
    } else if (doorDist < DOOR_RANGE_FAR) {
      this.doorSprite.setFrame(D.door_half_open);
    } else {
      this.doorSprite.setFrame(D.door_closed);
    }

    if (this.player.y <= DOOR_Y_THRESHOLD) {
      this.articlePanel.hide();
      this.scene.start('BedroomScene', { from: 'garden' });
    }

    // Chest proximity → show recent articles
    const chestCX = this.chestSprite.x + 8;
    const chestCY = this.chestSprite.y + 8;
    const chestDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chestCX, chestCY);
    if (chestDist < 28) {
      this.chestSprite.setFrame(CH.small_open);
      if (!this.chestOpen) {
        this.chestOpen = true;
        this.articlePanel.showRecent(this.articles.slice(0, 5));
      }
    } else if (chestDist < 40) {
      this.chestSprite.setFrame(CH.small_half_open);
      if (this.chestOpen) {
        this.chestOpen = false;
        this.articlePanel.hide();
      }
    } else {
      this.chestSprite.setFrame(CH.small_closed);
      if (this.chestOpen) {
        this.chestOpen = false;
        this.articlePanel.hide();
      }
    }

    this.updateProximityPanel();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private drawGarden() {
    // ── Grass ground ──────────────────────────────────────────────────────
    this.placeGrass(0, 0, G.grass_top_left);
    for (let col = 1; col < COLS - 1; col++) {
      this.placeGrass(col, 0, G.grass_top);
    }
    this.placeGrass(COLS - 1, 0, G.grass_top_right);

    for (let row = 1; row < ROWS - 1; row++) {
      this.placeGrass(0, row, G.grass_left);
      for (let col = 1; col < COLS - 1; col++) {
        const hash = (col * 7 + row * 13) % 9;
        if (hash === 0) {
          const texIdx = (col * 3 + row * 5) % G.textures.length;
          this.placeGrass(col, row, G.textures[texIdx]);
        } else {
          this.placeGrass(col, row, G.grass_middle);
        }
      }
      this.placeGrass(COLS - 1, row, G.grass_right);
    }

    this.placeGrass(0, ROWS - 1, G.grass_bottom_left);
    for (let col = 1; col < COLS - 1; col++) {
      this.placeGrass(col, ROWS - 1, G.grass_bottom);
    }
    this.placeGrass(COLS - 1, ROWS - 1, G.grass_bottom_right);

    // ── Door (placed after grass so it's not covered) ─────────────────
    this.doorSprite = this.add
      .image(DOOR_COL * TILE, DOOR_ROW * TILE, 'doors', D.door_closed)
      .setOrigin(0, 0);

    // ── Fences (full perimeter with door gap at top) ───────────────────
    // Top: left section → gap at DOOR_COL → right section
    this.placeFence(1, 1, FE.top_left_2);
    for (let col = 2; col <= DOOR_COL - 1; col++) this.placeFence(col, 1, FE.middle_2);
    for (let col = DOOR_COL + 1; col <= COLS - 3; col++) this.placeFence(col, 1, FE.middle_2);
    this.placeFence(COLS - 2, 1, FE.top_right_2);

    // Sides
    for (let row = 2; row <= 12; row++) this.placeFence(1, row, FE.middle_1);
    for (let row = 2; row <= 12; row++) this.placeFence(COLS - 2, row, FE.middle_1);

    // Bottom
    this.placeFence(1, 13, FE.bottom_left_2);
    for (let col = 2; col <= COLS - 3; col++) this.placeFence(col, 13, FE.middle_2);
    this.placeFence(COLS - 2, 13, FE.bottom_right_2);

    // ── Grass-biome decorations ───────────────────────────────────────────
    const decoSpots: [number, number, number][] = [
      [3,  3,  GB.red_mushroom],
      [15, 3,  GB.purple_mushroom],
      [4,  11, GB.sproutlings],
      [16, 10, GB.small_rock],
      [2,  8,  GB.sprout],
      [17, 6,  GB.rock],
      [14, 11, GB.small_rock],
      [3,  6,  GB.sprout],
    ];
    for (const [col, row, frame] of decoSpots) {
      this.add.image(col * TILE, row * TILE, 'grass-biome', frame).setOrigin(0, 0);
    }

    // ── Recent articles chest ──────────────────────────────────────────
    this.chestSprite = this.add
      .image(4 * TILE, 2 * TILE, 'chest', CH.small_closed)
      .setOrigin(0, 0);

  }

  private placeGrass(col: number, row: number, frame: number) {
    this.add.image(col * TILE, row * TILE, 'grass', frame).setOrigin(0, 0);
  }

  private placeFence(col: number, row: number, frame: number) {
    this.add.image(col * TILE, row * TILE, 'fences', frame).setOrigin(0, 0);
  }

  private placeFlowers() {
    this.articles.forEach((article, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const x = 160 + side * (40 + (i % 3) * 16);
      const y = 80 + row * 30;

      const frame = TAG_FLOWERS[article.tags[0]] ?? GB.small_sunflower;
      const flowerSprite = this.add.image(x, y, 'grass-biome', frame)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.articlePanel.show(article));

      this.flowerObjects.push({ sprite: flowerSprite, article });
    });
  }

  private updateProximityPanel() {
    const px = this.player.x;
    const py = this.player.y;

    let nearest: { sprite: Phaser.GameObjects.Image; article: Article } | null = null;
    let nearestDist = Infinity;

    for (const f of this.flowerObjects) {
      const dist = Phaser.Math.Distance.Between(px, py, f.sprite.x, f.sprite.y);
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

}
