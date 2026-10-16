import Phaser from 'phaser';
import { PlayerController, PLAYER_FEET, type Rect } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { Walker, type Direction } from '../systems/Walker';
import { ComputerPanel } from '../ui/ComputerPanel';
import { ThoughtBubble } from '../ui/ThoughtBubble';
import { loadProjects, Project } from '../data/content-loader';
import { MUSINGS, type MusingSpot } from '../data/musings';
import { toFrameMap } from '../data/tilemaps';
import { SakuraDoor, SakuraHost, SakuraRoom } from '../data/sakura-sprites';

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
  { name: 'dresser',  x: 40,  y: 64 },
  { name: 'dresser',  x: 98,  y: 58 },
  { name: 'computer', x: 266, y: 76 },
  { name: 'bed',      x: 48,  y: 176 },
  { name: 'window',   x: 160, y: 8 },
  { name: 'clock',    x: 218, y: 8 },
];

const INTERACT_RANGE = 32;
const DOOR_Y_THRESHOLD = 228; // walk south past this → garden
const DOOR_REENTRY_Y = 206;   // spawn from garden near bedroom door

// ─── Tile grid constants ─────────────────────────────────────────────────────
const TILE = 16;
const COLS = 20; // 320 / 16
const ROWS = 15; // 240 / 16

const R = toFrameMap(SakuraRoom);
const DR = toFrameMap(SakuraDoor);
const HF = toFrameMap(SakuraHost);
const FLOORS = [R.floor_0, R.floor_0, R.floor_1, R.floor_2];

// Two-tile sliding door, centred under the window
const DOOR_COLS = [9, 10];
const DOOR_CENTER_X = 160;
const DOOR_CENTER_Y = (ROWS - 1) * TILE + TILE / 2; // 232
const DOOR_RANGE_FAR = 48;
const DOOR_RANGE_NEAR = 32;

// Furniture footprints the player can't walk through (the bed stays walkable —
// flopping onto it is a feature).
const COLLIDERS: Rect[] = [
  { x: 24,  y: 40, w: 32, h: 12 }, // bookshelf
  { x: 84,  y: 36, w: 28, h: 12 }, // dresser
  { x: 239, y: 30, w: 54, h: 20 }, // desk
  { x: 251, y: 56, w: 30, h: 10 }, // chair
  { x: 294, y: 204, w: 12, h: 10 }, // plant
  { x: 20,  y: 102, w: 12, h: 10 }, // plant
  { x: 16,  y: 226, w: 128, h: 14 }, // bottom wall, left of the door
  { x: 176, y: 226, w: 128, h: 14 }, // bottom wall, right of the door
];

// ─── Host character routine ──────────────────────────────────────────────────
const AISLE_Y = 90;                          // open floor between furniture rows
const SEAT = { x: 266, y: 44 };              // seated sprite position at the desk
const HOST_FEET = 18;                        // sprite centre → feet (42 px tall frames)
const HOST_HEAD = 19;                        // sprite centre → top of head
const CHAIR_SEAT_Y = 58;                     // seated: nothing of her draws below the seat
const BESIDE_CHAIR = { x: 238, y: 62 };      // where she stands up / sits down
const CUSHION = { x: 214, y: 186 };
type Spot = { x: number; y: number; face: Direction; musing: MusingSpot };
const SPOTS: Spot[] = [
  { x: 160, y: 38,  face: 'up',   musing: 'window' },
  { x: 40,  y: 66,  face: 'up',   musing: 'books' },
  { x: 150, y: 122, face: 'down', musing: 'any' },
];

/**
 * BedroomScene
 * Main hub of the site. Player navigates around the bedroom and interacts
 * with objects. The host character potters about on her own — coding at the
 * desk, wandering to the window or bookshelf, checking on the cat — and
 * thinks out loud in a bubble that never blocks the player.
 */
export class BedroomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private controller!: PlayerController;
  private dialogue!: DialogueSystem;
  private doorSprite!: Phaser.GameObjects.Image;
  private catSprite!: Phaser.GameObjects.Sprite;
  private cat!: Walker;
  private catNapping = false;
  private host!: Phaser.GameObjects.Sprite;
  private hostWalker!: Walker;
  private hostSeated = false;
  private hostSpot: MusingSpot = 'desk';
  private bubble!: ThoughtBubble;
  private computer!: Phaser.GameObjects.Image;
  private screenGlow!: Phaser.GameObjects.Image;
  private chair!: Phaser.GameObjects.Image;
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
    this.hostSeated = false;
    this.catNapping = false;

    this.computerPanel = new ComputerPanel();
    const label = document.getElementById('scene-label');
    if (label) label.textContent = 'bedroom';
    this.drawRoom();
    this.addHost();
    this.addCat();

    const spawnY = data?.from === 'garden' ? DOOR_REENTRY_Y : 160;
    this.player = this.add.sprite(160, spawnY, 'visitor', 0);
    this.controller = new PlayerController(this, this.player, {
      minX: 26, maxX: 298, minY: 24, maxY: 235,
    }, COLLIDERS);
    this.dialogue = new DialogueSystem();

    this.bubble = new ThoughtBubble();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.bubble.destroy());

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.onAction());
    this.input.keyboard?.on('keydown-ENTER', () => this.onAction());
    this.input.on('pointerdown', () => this.onAction());

    this.runHost();
    this.runCat();
    this.scheduleThought();
    this.scheduleScreen();
  }

  update(_time: number, delta: number) {
    this.cat.update(delta);
    this.hostWalker.update(delta);
    this.sortDepths();
    if (this.bubble.visible) {
      this.bubble.place(this.game.canvas, this.scale.width, this.host.x, this.host.y - HOST_HEAD);
    }

    if (this.inDialogue) return;
    this.controller.update();

    // Faint when player walks onto the bed (x 32–64, y 144–208)
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
      this.doorSprite.setFrame(DR.door_open);
    } else if (doorDist < DOOR_RANGE_FAR) {
      this.doorSprite.setFrame(DR.door_half_open);
    } else {
      this.doorSprite.setFrame(DR.door_closed);
    }

    if (this.player.y >= DOOR_Y_THRESHOLD && Math.abs(this.player.x - DOOR_CENTER_X) < 16) {
      this.scene.start('GardenScene', { from: 'bedroom' });
    }
  }

  // ── Room ────────────────────────────────────────────────────────────────────

  private drawRoom() {
    const tile = (col: number, row: number, frame: number) =>
      this.add.image(col * TILE, row * TILE, 'sakura-room', frame).setOrigin(0, 0);

    for (let row = 1; row < ROWS - 1; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        tile(col, row, FLOORS[Math.abs(Math.imul(col * 73856093 ^ row * 19349663, 0x5bd1e995) >> 9) % FLOORS.length]);
      }
    }

    tile(0, 0, R.corner_tl);
    for (let col = 1; col < COLS - 1; col++) tile(col, 0, R.wall_top);
    tile(COLS - 1, 0, R.corner_tr);
    for (let row = 1; row < ROWS - 1; row++) {
      tile(0, row, R.wall_left);
      tile(COLS - 1, row, R.wall_right);
    }
    tile(0, ROWS - 1, R.corner_bl);
    for (let col = 1; col < COLS - 1; col++) if (!DOOR_COLS.includes(col)) tile(col, ROWS - 1, R.wall_bottom);
    tile(COLS - 1, ROWS - 1, R.corner_br);
    this.doorSprite = this.add.image(DOOR_COLS[0] * TILE, (ROWS - 1) * TILE, 'door-room', DR.door_closed).setOrigin(0, 0);

    // Wall decor
    this.add.image(118, 2, 'room-painting').setOrigin(0.5, 0).setDepth(2);
    this.add.image(160, 1, 'room-window').setOrigin(0.5, 0).setDepth(2);
    this.add.image(218, 2, 'room-clock').setOrigin(0.5, 0).setDepth(2);

    // Floor-level
    this.add.image(160, 128, 'room-rug').setDepth(1);
    this.add.image(CUSHION.x, CUSHION.y + 2, 'room-cushion').setDepth(1);

    // Furniture: origin at the bottom so depth = how far down the room it stands
    const prop = (key: string, x: number, y: number) =>
      this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);
    prop('room-bookshelf', 40, 52);
    prop('room-dresser', 98, 48);
    const desk = prop('room-desk', 266, 50);
    prop('room-bed', 48, 200);
    prop('room-plant', 300, 214);
    prop('room-plant', 26, 112);
    this.chair = prop('room-chair', 266, 66);

    this.computer = this.add.image(266, 33, 'computer', 0).setOrigin(0.5, 1).setDepth(desk.depth + 1);
    this.screenGlow = this.add.image(266, 17, 'sakura-glow')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x79c2ee)
      .setScale(0.9)
      .setAlpha(0)
      .setDepth(desk.depth + 2);
  }

  private sortDepths() {
    this.player.setDepth(this.player.y + PLAYER_FEET);
    this.catSprite.setDepth(this.catNapping ? CUSHION.y + 4 : this.catSprite.y + 7);
    this.host.setDepth(this.hostSeated ? this.chair.depth - 1 : this.host.y + HOST_FEET);
  }

  // ── Host character ─────────────────────────────────────────────────────────

  private addHost() {
    this.host = this.add.sprite(SEAT.x, SEAT.y, 'host', 0);
    this.hostWalker = new Walker(this.host, 'host', 0.035);
  }

  private wait(ms: number) {
    return new Promise<void>(resolve => this.time.delayedCall(ms, resolve));
  }

  /** Walk via the open aisle so she never cuts through furniture. */
  private hostWalkTo(x: number, y: number) {
    return this.hostWalker.walk([
      { x: this.host.x, y: AISLE_Y },
      { x, y: AISLE_Y },
      { x, y },
    ]);
  }

  private sit() {
    this.hostSeated = true;
    this.hostSpot = 'desk';
    this.host.setPosition(SEAT.x, SEAT.y).setFlipX(false).play('host-type');
    // Her hair rests on the seat and stays within the chair's back: anything
    // lower or wider would poke out around the chair.
    const left = this.chair.x - this.chair.width / 2 - (SEAT.x - this.host.width / 2);
    this.host.setCrop(Math.max(0, left), 0, this.chair.width, CHAIR_SEAT_Y - (SEAT.y - this.host.height / 2));
  }

  private standUp() {
    this.hostSeated = false;
    this.host.setCrop();
    this.host.setPosition(BESIDE_CHAIR.x, BESIDE_CHAIR.y);
    this.hostWalker.face('down');
  }

  private async runHost() {
    this.sit();
    let last: Spot | null = null;
    for (;;) {
      await this.wait(Phaser.Math.Between(10000, 18000));
      this.standUp();
      await this.wait(600);

      const visits = Phaser.Math.Between(1, 2);
      for (let i = 0; i < visits; i++) {
        let spot: Spot;
        if (Math.random() < 0.3) {
          // go say hi to the cat, wherever she is
          const side = this.catSprite.x > 160 ? -1 : 1;
          spot = {
            x: Phaser.Math.Clamp(Math.round(this.catSprite.x + side * 22), 30, 290),
            y: Phaser.Math.Clamp(Math.round(this.catSprite.y - 4), AISLE_Y, 206),
            face: side < 0 ? 'right' : 'left',
            musing: 'cat',
          };
        } else {
          const options = SPOTS.filter(s => s !== last);
          spot = options[Phaser.Math.Between(0, options.length - 1)];
          last = spot;
        }
        await this.hostWalkTo(spot.x, spot.y);
        this.hostWalker.face(spot.face);
        this.hostSpot = spot.musing;
        if (spot.musing === 'cat') this.host.stop().setFlipX(false).setFrame(HF.happy_0); // all smiles for Yuumi
        if (Math.random() < 0.7) this.think();
        await this.wait(Phaser.Math.Between(3500, 6500));
      }

      await this.hostWalkTo(BESIDE_CHAIR.x, BESIDE_CHAIR.y);
      this.hostWalker.face('up');
      await this.wait(400);
      this.sit();
    }
  }

  private think() {
    const lines = [...MUSINGS[this.hostSpot], ...MUSINGS.any];
    this.bubble.show(lines[Phaser.Math.Between(0, lines.length - 1)]);
    this.bubble.place(this.game.canvas, this.scale.width, this.host.x, this.host.y - HOST_HEAD);
  }

  private scheduleThought() {
    this.time.delayedCall(Phaser.Math.Between(9000, 20000), () => {
      if (!this.bubble.visible) this.think();
      this.scheduleThought();
    });
  }

  /** While she's coding the screen flickers between frames; otherwise a screensaver. */
  private scheduleScreen() {
    this.time.delayedCall(Phaser.Math.Between(350, 1600), () => {
      if (this.hostSeated) {
        this.computer.setFrame(Phaser.Math.Between(1, 4));
        this.screenGlow.setAlpha(Phaser.Math.FloatBetween(0.1, 0.18));
      } else {
        this.computer.setFrame(0);
        this.screenGlow.setAlpha(0.06);
      }
      this.scheduleScreen();
    });
  }

  // ── Cat ─────────────────────────────────────────────────────────────────────

  private addCat() {
    this.catSprite = this.add.sprite(200, 140, 'cat', 0);
    this.cat = new Walker(this.catSprite, 'cat', 0.03);
    this.cat.face('down');
  }

  private async runCat() {
    for (;;) {
      const roll = Math.random();
      if (roll < 0.25) {
        await this.cat.walk([
          { x: CUSHION.x, y: this.catSprite.y },
          { x: CUSHION.x, y: CUSHION.y },
        ]);
        this.catNapping = true;
        this.catSprite.setFlipX(false).play('cat-sleep');
        await this.wait(Phaser.Math.Between(9000, 16000));
        this.catNapping = false;
        this.cat.face('down');
      } else if (roll < 0.75) {
        let tx = 0, ty = 0;
        do {
          tx = Phaser.Math.Between(40, 290);
          ty = Phaser.Math.Between(AISLE_Y + 8, 210);
        } while (tx < 80 && ty > 135); // keep off the bed
        await this.cat.walk([
          { x: tx, y: this.catSprite.y },
          { x: tx, y: ty },
        ]);
        await this.wait(Phaser.Math.Between(1500, 4000));
      } else {
        const dirs: Direction[] = ['down', 'left', 'right', 'up'];
        this.cat.face(dirs[Phaser.Math.Between(0, 3)]);
        await this.wait(Phaser.Math.Between(2000, 5000));
      }
    }
  }

  // ── Interaction ─────────────────────────────────────────────────────────────

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
}
