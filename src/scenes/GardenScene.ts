import Phaser from 'phaser';
import { PlayerController, PLAYER_FEET, type Rect } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { loadArticles, Article } from '../data/content-loader';
import { ArticlePanel } from '../ui/ArticlePanel';
import { Fences, GrassBiomePlants, Chests, toFrameMap } from '../data/tilemaps';
import { SakuraDoorGarden, SakuraTiles } from '../data/sakura-sprites';

const DOOR_Y_THRESHOLD = 12; // walk up into the doorway past this → bedroom
const PROXIMITY = 28;
const GARDEN_ENTRY_Y = 28;

// ─── Tile grid constants ─────────────────────────────────────────────────────
const TILE = 16;
const COLS = 20; // 320 / 16
const ROWS = 15; // 240 / 16

const ST = toFrameMap(SakuraTiles);
const D = toFrameMap(SakuraDoorGarden);
const FE = toFrameMap(Fences);
const GB = toFrameMap(GrassBiomePlants);
const CH = toFrameMap(Chests);

const GRASS_VARIANTS = [ST.grass_0, ST.grass_0, ST.grass_0, ST.grass_0, ST.grass_1, ST.grass_2, ST.grass_3];
const PETAL_VARIANTS = [ST.grass_petals_0, ST.grass_petals_1, ST.grass_petals_2];

// Stone path from the door down through the garden.
const PATH = new Set<string>(['9,1', '10,1']);
for (let row = 2; row <= 12; row++) for (let col = 8; col <= 11; col++) PATH.add(`${col},${row}`);
const isPath = (col: number, row: number) => PATH.has(`${col},${row}`);

// Sakura trees (base of trunk) and stone lanterns (base of plinth), in px.
const TREES: [number, number][] = [[56, 200], [264, 200]];
const LANTERNS: [number, number][] = [[112, 60], [208, 60]];

// Fence lines (with the door gap), trunks, lantern plinths and the chest.
const COLLIDERS: Rect[] = [
  { x: 16,  y: 20,  w: 128, h: 10 }, // top fence, left of door
  { x: 176, y: 20,  w: 128, h: 10 }, // top fence, right of door
  { x: 16,  y: 16,  w: 14,  h: 208 }, // left fence
  { x: 290, y: 16,  w: 14,  h: 208 }, // right fence
  { x: 16,  y: 212, w: 288, h: 12 }, // bottom fence
  ...TREES.map(([x, y]) => ({ x: x - 6, y: y - 6, w: 12, h: 6 })),
  ...LANTERNS.map(([x, y]) => ({ x: x - 6, y: y - 6, w: 12, h: 6 })),
  { x: 66, y: 38, w: 12, h: 8 }, // chest
];

// Two-tile sliding door in the top fence, centred on the path
const DOOR_COLS = [9, 10];
const DOOR_CENTER_X = 160;
const DOOR_ROW = 1;
const DOOR_CENTER_Y = DOOR_ROW * TILE + TILE / 2;
const DOOR_RANGE_FAR = 48;
const DOOR_RANGE_NEAR = 32;


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
  private canopies: Phaser.GameObjects.Image[] = [];
  private lanterns: Phaser.GameObjects.Sprite[] = [];
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
    this.canopies = [];
    this.lanterns = [];

    this.drawGarden();
    this.addPetals();

    const spawnY = data?.from === 'bedroom' ? GARDEN_ENTRY_Y : GARDEN_ENTRY_Y;
    this.player = this.add.sprite(160, spawnY, 'visitor', 0);
    this.controller = new PlayerController(this, this.player, {
      minX: 30, maxX: 286, minY: 8, maxY: 206,
    }, COLLIDERS);


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
    this.updateSakuraDepth();

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

    // Only the doorway leads inside; the fence collider keeps her out of the rest of that row.
    if (this.player.y <= DOOR_Y_THRESHOLD && Math.abs(this.player.x - DOOR_CENTER_X) < 16) {
      this.articlePanel.hide();
      this.scene.start('BedroomScene', { from: 'garden' });
    }

    // Chest proximity → show recent articles
    const chestCX = this.chestSprite.x + 8;
    const chestCY = this.chestSprite.y + 8;
    const chestDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chestCX, chestCY);
    if (chestDist < 28) {
      this.chestSprite.setFrame(CH.small_chest_open);
      if (!this.chestOpen) {
        this.chestOpen = true;
        this.articlePanel.showRecent(this.articles.slice(0, 5));
      }
    } else if (chestDist < 40) {
      this.chestSprite.setFrame(CH.small_chest_half_open);
      if (this.chestOpen) {
        this.chestOpen = false;
        this.articlePanel.hide();
      }
    } else {
      this.chestSprite.setFrame(CH.small_chest);
      if (this.chestOpen) {
        this.chestOpen = false;
        this.articlePanel.hide();
      }
    }

    this.updateProximityPanel();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private drawGarden() {
    // ── Ground: grass, with petal-strewn variants under the trees ─────────
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const h = Math.abs(Math.imul(col * 73856093 ^ row * 19349663, 0x5bd1e995) >> 7);
        const cx = col * TILE + TILE / 2, cy = row * TILE + TILE / 2;
        const underTree = TREES.some(([tx, ty]) => Math.hypot(cx - tx, (cy - ty) * 1.5) < 48);
        const frame = isPath(col, row)
          ? this.pathFrame(col, row)
          : underTree && h % 3 !== 0
            ? PETAL_VARIANTS[h % PETAL_VARIANTS.length]
            : GRASS_VARIANTS[h % GRASS_VARIANTS.length];
        this.add.image(col * TILE, row * TILE, 'sakura-tiles', frame).setOrigin(0, 0);
      }
    }

    // ── Door (placed after grass so it's not covered) ─────────────────
    this.doorSprite = this.add
      .image(DOOR_COLS[0] * TILE, DOOR_ROW * TILE, 'door-garden', D.door_closed)
      .setOrigin(0, 0)
      .setDepth((DOOR_ROW + 1) * TILE);

    // ── Fences (full perimeter with door gap at top) ───────────────────
    // Top: left section → two-tile door gap → right section
    this.placeFence(1, 1, FE.fence_top_left_2);
    for (let col = 2; col < DOOR_COLS[0]; col++) this.placeFence(col, 1, FE.fence_middle_2);
    for (let col = DOOR_COLS[1] + 1; col <= COLS - 3; col++) this.placeFence(col, 1, FE.fence_middle_2);
    this.placeFence(COLS - 2, 1, FE.fence_top_right_2);

    // Sides
    for (let row = 2; row <= 12; row++) this.placeFence(1, row, FE.fence_middle_1);
    for (let row = 2; row <= 12; row++) this.placeFence(COLS - 2, row, FE.fence_middle_1);

    // Bottom
    this.placeFence(1, 13, FE.fence_bottom_left_2);
    for (let col = 2; col <= COLS - 3; col++) this.placeFence(col, 13, FE.fence_middle_2);
    this.placeFence(COLS - 2, 13, FE.fence_bottom_right_2);

    // ── Stone lanterns ────────────────────────────────────────────────────
    for (const [x, y] of LANTERNS) {
      this.add.image(x, y + 1, 'sakura-shadow').setOrigin(0.5, 1);
      const glow = this.add.image(x, y - 19, 'sakura-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.1)
        .setDepth(1001);
      this.tweens.add({
        targets: glow, alpha: 0.16, duration: 900 + x, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
      this.lanterns.push(this.add.sprite(x, y, 'sakura-lantern', 0).setOrigin(0.5, 1).play('lantern-flicker'));
    }

    // ── Sakura trees (drawn above fences; fade when the player walks under) ─
    for (const [x, y] of TREES) {
      this.canopies.push(this.add.image(x, y, 'sakura-tree').setOrigin(0.5, 0.95).setDepth(y));
    }

    // ── Recent articles chest ──────────────────────────────────────────
    this.chestSprite = this.add
      .image(4 * TILE, 2 * TILE, 'chest', CH.small_chest)
      .setOrigin(0, 0)
      .setDepth(3 * TILE);

  }

  /** Autotile: pick the path frame whose open edges match the neighbours. */
  private pathFrame(col: number, row: number) {
    const dirs = [
      ['n', isPath(col, row - 1)], ['e', isPath(col + 1, row)],
      ['s', isPath(col, row + 1)], ['w', isPath(col - 1, row)],
    ] as const;
    const suffix = dirs.filter(([, on]) => on).map(([d]) => d).join('') || 'single';
    return ST[`path_${suffix}` as keyof typeof ST];
  }

  /** Falling petals: a light drift across the whole garden, heavier under trees. */
  private addPetals() {
    const base = {
      anim: 'petal-tumble',
      lifespan: 18000,
      speedX: { min: -14, max: -4 },
      speedY: { min: 8, max: 16 },
      accelerationX: { min: -3, max: 3 },
      alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
    };
    this.add.particles(0, -6, 'sakura-petals', {
      ...base,
      x: { min: 0, max: 380 },
      frequency: 600,
    }).setDepth(1000); // petals drift over everything

    for (const [x, y] of TREES) {
      this.add.particles(x, y - 60, 'sakura-petals', {
        ...base,
        lifespan: 4500,
        x: { min: -26, max: 26 },
        y: { min: -10, max: 20 },
        frequency: 700,
      }).setDepth(1000); // petals drift over everything
    }
  }

  /** Lanterns sort against the player; canopies go see-through when walked under. */
  private updateSakuraDepth() {
    const { x, y } = this.player;
    this.player.setDepth(y + PLAYER_FEET);
    for (const l of this.lanterns) l.setDepth(l.y);
    for (const c of this.canopies) {
      const under = Math.abs(x - c.x) < 30 && y < c.y - 6 && y > c.y - 72;
      c.setAlpha(under ? 0.65 : 1);
    }
  }

  private placeFence(col: number, row: number, frame: number) {
    // Depth = the fence's bottom edge, so the player sorts in front of or behind it.
    this.add.image(col * TILE, row * TILE, 'fences', frame).setOrigin(0, 0).setDepth((row + 1) * TILE);
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
