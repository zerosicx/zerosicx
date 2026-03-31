import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';

// ─── Object dialogue lines ───────────────────────────────────────────────────
const DIALOGUES: Record<string, string[]> = {
  cat:       ["Mrow.", "...she stares at you judgementally.", "(adorable)"],
  bed:       ["Zzz... not right now.", "There are things to explore first."],
  bookshelf: ["Currently reading: The Pragmatic Programmer.", "Some old favourites on the shelf too."],
  window:    ["Sunlight filters through the curtains.", "A good day to make something."],
  pinboard:  ["Notes, doodles, and a few too many sticky notes.", "The organised chaos of a developer."],
  computer:  ["*the screen flickers to life*", "Head to the Projects section..."],
};

// ─── Object positions (placeholder, replace with Tiled object layer later) ───
const OBJECTS = [
  { name: 'bookshelf', x: 48,  y: 40,  w: 48, h: 32, color: 0x8b5cf6 },
  { name: 'pinboard',  x: 140, y: 40,  w: 48, h: 32, color: 0xfbbf24 },
  { name: 'computer',  x: 268, y: 60,  w: 40, h: 48, color: 0x6366f1 },
  { name: 'bed',       x: 64,  y: 180, w: 64, h: 48, color: 0xf472b6 },
  { name: 'cat',       x: 200, y: 140, w: 16, h: 16, color: 0xfcd34d },
  { name: 'window',    x: 260, y: 40,  w: 32, h: 24, color: 0x93c5fd },
];

const INTERACT_RANGE = 32;
const DOOR_Y_THRESHOLD = 228; // walk south past this → garden
const DOOR_REENTRY_Y = 206; // spawn from garden near bedroom door

/**
 * BedroomScene
 * Main hub of the site. Player navigates around the bedroom
 * and interacts with objects to trigger dialogue or transitions.
 *
 * Phase 1: All objects are coloured rectangles (placeholder).
 * Phase 2: Replace with Tiled tilemap + actual spritesheets.
 */
export class BedroomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private controller!: PlayerController;
  private dialogue!: DialogueSystem;
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

    this.drawRoom();

    // Player
    const spawnY = data?.from === 'garden' ? DOOR_REENTRY_Y : 160;
    this.player = this.add.rectangle(160, spawnY, 12, 16, 0xff90c0);
    this.controller = new PlayerController(this, this.player);
    this.dialogue = new DialogueSystem();

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.onAction());
    this.input.keyboard?.on('keydown-ENTER', () => this.onAction());
    this.input.on('pointerdown', () => this.onAction());
  }

  update() {
    if (this.inDialogue) return;
    this.controller.update();

    // Transition to garden when player walks south through the door
    if (this.player.y >= DOOR_Y_THRESHOLD) {
      this.scene.start('GardenScene', { from: 'bedroom' });
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private drawRoom() {
    // Floor
    this.add.rectangle(160, 120, 320, 240, 0xf9d8e8);

    // Walls
    this.add.rectangle(160, 8,   320, 16,  0xc084a0); // top
    this.add.rectangle(4,   120, 8,   240, 0xc084a0); // left
    this.add.rectangle(316, 120, 8,   240, 0xc084a0); // right

    // Door south (visible gap in bottom wall)
    this.add.rectangle(160, 236, 40, 8, 0xa78bfa);

    // Placeholder objects
    for (const obj of OBJECTS) {
      this.add.rectangle(obj.x, obj.y, obj.w, obj.h, obj.color);
    }

    // Dev label — remove in Phase 2
    this.add.text(4, 226, 'bedroom \u2014 phase 1 placeholder', {
      fontSize: '5px',
      color: '#c084a0',
      resolution: 3,
    });
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

    for (const obj of OBJECTS) {
      const dist = Phaser.Math.Distance.Between(px, py, obj.x, obj.y);
      if (dist < INTERACT_RANGE) {
        this.startDialogue(DIALOGUES[obj.name] ?? ['...']);
        return;
      }
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
