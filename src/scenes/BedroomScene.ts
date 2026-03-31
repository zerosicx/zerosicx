import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { ComputerPanel } from '../ui/ComputerPanel';
import { loadProjects, Project } from '../data/content-loader';

// ─── Object dialogue lines ───────────────────────────────────────────────────
const DIALOGUES: Record<string, string[]> = {
  cat:      ["Mrow.", "...she stares at you judgementally.", "(adorable)"],
  bed:      ["Zzz... not right now.", "There are things to explore first."],
  dresser:  [
    "A stack of things I'm into right now...",
    "Pixel art: 'The ONLY Pixel Art Guide You Need' by Juniper Dev.",
    "I've watched it three times. Don't judge me.",
    "Also grinding through Shin Kanzen Master N3.",
    "I want to go to Japan again... spring would be perfect.",
    "Cherry blossoms and konbini onigiri. A girl can dream.",
  ],
  window:   ["Sunlight filters through the curtains.", "A good day to make something."],
};

// ─── Interaction hotspots ────────────────────────────────────────────────────
const OBJECTS = [
  { name: 'dresser',  x: 96,  y: 32 },
  { name: 'dresser',  x: 128, y: 32 },
  { name: 'computer', x: 288, y: 144 },
  { name: 'bed',      x: 48,  y: 176 },
  { name: 'window',   x: 264, y: 8 },
  { name: 'clock',    x: 200, y: 8 },
];

const INTERACT_RANGE = 32;
const DOOR_Y_THRESHOLD = 228; // walk south past this → garden
const DOOR_REENTRY_Y = 206;   // spawn from garden near bedroom door

// ─── Tile grid constants ─────────────────────────────────────────────────────
const TILE = 16;
const COLS = 20; // 320 / 16
const ROWS = 15; // 240 / 16
const SPRITESHEET_COLS = 7; // WoodenHouse.png has 7 columns

// Frame indices computed as row * SPRITESHEET_COLS + col
const F = {
  wall_window:       0 * SPRITESHEET_COLS + 1,
  top_left_wall:     1 * SPRITESHEET_COLS + 0,
  top_middle_wall:   1 * SPRITESHEET_COLS + 1,
  top_right_wall:    1 * SPRITESHEET_COLS + 2,
  left_wall:         2 * SPRITESHEET_COLS + 0,
  floor:             2 * SPRITESHEET_COLS + 1,
  right_wall:        2 * SPRITESHEET_COLS + 2,
  bottom_left_wall:  3 * SPRITESHEET_COLS + 0,
  bottom_wall:       3 * SPRITESHEET_COLS + 1,
  bottom_right_wall: 3 * SPRITESHEET_COLS + 2,
} as const;

// Door frames (Doors.png — single column spritesheet)
const D = {
  entrance_no_door: 0,
  door_closed:      1,
  door_open:        2,
  door_half_open:   3,
} as const;

const DOOR_COL = 10;
const DOOR_CENTER_X = DOOR_COL * TILE + TILE / 2; // 168
const DOOR_CENTER_Y = (ROWS - 1) * TILE + TILE / 2; // 232
const DOOR_RANGE_FAR = 48;
const DOOR_RANGE_NEAR = 32;

// Furniture frame indices (BasicFurniture.png — 9 columns)
const FURN_COLS = 9;
const FN = {
  painting_0_0:            0 * FURN_COLS + 0,
  painting_0_1:            0 * FURN_COLS + 1,
  painting_0_2:            0 * FURN_COLS + 2,
  sunflower:               0 * FURN_COLS + 3,
  sprout:                  0 * FURN_COLS + 4,
  potted_small_flower:     0 * FURN_COLS + 5,
  bed_forward_top_pink:    1 * FURN_COLS + 2,
  bed_forward_bottom_pink: 2 * FURN_COLS + 2,
  dresser:                 2 * FURN_COLS + 3,
  chair_right:             2 * FURN_COLS + 4,
  large_table:             3 * FURN_COLS + 3,
  large_hanging_clock:     3 * FURN_COLS + 5,
} as const;

const WINDOW_COL = 16;

/**
 * BedroomScene
 * Main hub of the site. Player navigates around the bedroom
 * and interacts with objects to trigger dialogue or transitions.
 *
 * Phase 1: All objects are coloured rectangles (placeholder).
 * Phase 2: Replace with Tiled tilemap + actual spritesheets.
 */
export class BedroomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private controller!: PlayerController;
  private dialogue!: DialogueSystem;
  private doorSprite!: Phaser.GameObjects.Image;
  private catSprite!: Phaser.GameObjects.Sprite;
  private catState: 'idle' | 'walking' = 'idle';
  private catTimer = 0;
  private catDir: 'down' | 'up' | 'left' | 'right' = 'down';
  private computerPanel!: ComputerPanel;
  private projects: Project[] | null = null;
  private activeDialogue: string[] = [];
  private dialogueIndex = 0;
  private inDialogue = false;

  constructor() {
    super({ key: 'BedroomScene' });
  }

  create(data?: { from?: 'garden' }) {
    this.inDialogue = false;
    this.activeDialogue = [];
    this.dialogueIndex = 0;

    this.computerPanel = new ComputerPanel();
    const label = document.getElementById('scene-label');
    if (label) label.textContent = 'bedroom';
    this.drawRoom();

    const spawnY = data?.from === 'garden' ? DOOR_REENTRY_Y : 160;
    this.player = this.add.sprite(160, spawnY, 'visitor', 0);
    this.controller = new PlayerController(this, this.player, {
      minX: 26, maxX: 298, minY: 24, maxY: 235,
    });
    this.dialogue = new DialogueSystem();

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.onAction());
    this.input.keyboard?.on('keydown-ENTER', () => this.onAction());
    this.input.on('pointerdown', () => this.onAction());
  }

  update(_time: number, delta: number) {
    this.updateCat(delta);
    if (this.inDialogue) return;
    this.controller.update();

    // Faint when player walks onto the bed (2x bed area: x 32–64, y 144–208)
    const onBed = this.player.x >= 32 && this.player.x <= 64
      && this.player.y >= 144 && this.player.y <= 208;
    if (onBed && !this.controller.isFainted) {
      this.controller.faint();
    }

    // Animate door based on player proximity
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

    if (this.player.y >= DOOR_Y_THRESHOLD) {
      this.scene.start('GardenScene', { from: 'bedroom' });
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private drawRoom() {
    // Floor
    this.add
      .tileSprite(TILE, TILE, (COLS - 2) * TILE, (ROWS - 2) * TILE, 'wooden-house', F.floor)
      .setOrigin(0, 0);

    // ── Top wall (with wall_window at WINDOW_COL) ─────────────────────────
    this.placeTile(0, 0, F.top_left_wall);
    for (let col = 1; col < COLS - 1; col++) {
      this.placeTile(col, 0, col === WINDOW_COL ? F.wall_window : F.top_middle_wall);
    }
    this.placeTile(COLS - 1, 0, F.top_right_wall);

    // ── Side walls ───────────────────────────────────────────────────────
    for (let row = 1; row < ROWS - 1; row++) {
      this.placeTile(0, row, F.left_wall);
      this.placeTile(COLS - 1, row, F.right_wall);
    }

    // ── Bottom wall with door ────────────────────────────────────────────
    this.placeTile(0, ROWS - 1, F.bottom_left_wall);
    for (let col = 1; col < COLS - 1; col++) {
      if (col === DOOR_COL) continue;
      this.placeTile(col, ROWS - 1, F.bottom_wall);
    }
    this.placeTile(COLS - 1, ROWS - 1, F.bottom_right_wall);
    this.doorSprite = this.add
      .image(DOOR_COL * TILE, (ROWS - 1) * TILE, 'doors', D.door_closed)
      .setOrigin(0, 0);

    // ── Wall decorations (1× so they sit within the 16 px wall) ─────────
    this.placeDecor(5, 0, FN.painting_0_0);
    this.placeDecor(8, 0, FN.painting_0_1);
    this.placeDecor(12, 0, FN.large_hanging_clock);

    // ── Furniture (all 2×) ──────────────────────────────────────────────
    // Dressers side by side, flush against the wall
    this.placeFurn(5, 1, FN.dresser);
    this.placeFurn(7, 1, FN.dresser);

    // Computer desk: lower-right corner against the right wall
    this.placeFurn(15, 8, FN.chair_right);
    this.placeFurn(17, 8, FN.large_table);
    this.placeFurn(17, 8, FN.painting_0_2);

    // Bed (pink, forward-facing — top + bottom)
    this.placeFurn(2, 9, FN.bed_forward_top_pink);
    this.placeFurn(2, 11, FN.bed_forward_bottom_pink);

    // Decorative plants (1×)
    this.placeDecor(1, 2, FN.potted_small_flower);
    this.placeDecor(1, 7, FN.sprout);
    this.placeDecor(17, 12, FN.sunflower);

    // Yuumi
    this.catSprite = this.add.sprite(200, 140, 'cat', 13).setScale(2);
    this.catSprite.play('cat-idle-forward');

  }

  private placeTile(col: number, row: number, frame: number) {
    this.add.image(col * TILE, row * TILE, 'wooden-house', frame).setOrigin(0, 0);
  }

  private placeFurn(col: number, row: number, frame: number) {
    this.add.image(col * TILE, row * TILE, 'furniture', frame).setOrigin(0, 0).setScale(2);
  }

  private placeDecor(col: number, row: number, frame: number) {
    this.add.image(col * TILE, row * TILE, 'furniture', frame).setOrigin(0, 0);
  }

  private onAction() {
    if (this.inDialogue) {
      this.advanceDialogue();
      return;
    }
    this.tryInteract();
  }

  private tryInteract() {
    const px = this.player.x;
    const py = this.player.y;

    // Dynamic cat interaction (follows the sprite)
    const catDist = Phaser.Math.Distance.Between(px, py, this.catSprite.x, this.catSprite.y);
    if (catDist < INTERACT_RANGE) {
      this.startDialogue(DIALOGUES.cat);
      return;
    }

    for (const obj of OBJECTS) {
      const dist = Phaser.Math.Distance.Between(px, py, obj.x, obj.y);
      if (dist < INTERACT_RANGE) {
        if (obj.name === 'computer') {
          this.openComputerPanel();
        } else if (obj.name === 'clock') {
          const now = new Date();
          const h = now.getHours() % 12 || 12;
          const m = now.getMinutes().toString().padStart(2, '0');
          const period = now.getHours() >= 12 ? 'PM' : 'AM';
          this.startDialogue([`The time is ${h}:${m} ${period}.`, "Tick, tock..."]);
        } else {
          this.startDialogue(DIALOGUES[obj.name] ?? ['...']);
        }
        return;
      }
    }
  }

  private openComputerPanel() {
    this.inDialogue = true;
    const showPanel = (projects: Project[]) => {
      this.computerPanel.show(projects, () => { this.inDialogue = false; });
    };

    if (this.projects) {
      showPanel(this.projects);
    } else {
      loadProjects()
        .then(projects => { this.projects = projects; showPanel(projects); })
        .catch(() => { showPanel([]); });
    }
  }

  private startDialogue(lines: string[]) {
    this.inDialogue = true;
    this.activeDialogue = lines;
    this.dialogueIndex = 0;
    this.dialogue.show(lines[0]);
  }

  private advanceDialogue() {
    if (this.dialogue.isTyping()) {
      this.dialogue.skipTyping();
      return;
    }
    this.dialogueIndex++;
    if (this.dialogueIndex >= this.activeDialogue.length) {
      this.dialogue.hide();
      this.inDialogue = false;
    } else {
      this.dialogue.show(this.activeDialogue[this.dialogueIndex]);
    }
  }

  // ── Cat wandering AI ──────────────────────────────────────────────────────

  private updateCat(delta: number) {
    this.catTimer -= delta;
    if (this.catTimer <= 0) {
      if (this.catState === 'idle') {
        this.catState = 'walking';
        const dirs = ['down', 'up', 'left', 'right'] as const;
        this.catDir = dirs[Phaser.Math.Between(0, 3)];
        this.catTimer = Phaser.Math.Between(1000, 2500);
        this.playCatAnim('walk');
      } else {
        this.catState = 'idle';
        this.catTimer = Phaser.Math.Between(2000, 5000);
        this.playCatAnim('idle');
      }
    }

    if (this.catState === 'walking') {
      const speed = 0.3;
      switch (this.catDir) {
        case 'left':  this.catSprite.x -= speed; break;
        case 'right': this.catSprite.x += speed; break;
        case 'up':    this.catSprite.y -= speed; break;
        case 'down':  this.catSprite.y += speed; break;
      }
      this.catSprite.x = Phaser.Math.Clamp(this.catSprite.x, 30, 294);
      this.catSprite.y = Phaser.Math.Clamp(this.catSprite.y, 40, 220);
    }
  }

  private playCatAnim(mode: 'idle' | 'walk') {
    const key =
      this.catDir === 'down'  ? `cat-${mode}-forward` :
      this.catDir === 'up'    ? `cat-${mode}-back`    :
                                `cat-${mode}-side`;

    this.catSprite.setFlipX(this.catDir === 'left');
    this.catSprite.play(key, true);
  }
}
