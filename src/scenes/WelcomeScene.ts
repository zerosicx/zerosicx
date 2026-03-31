import Phaser from 'phaser';
import { DialogueSystem } from '../systems/DialogueSystem';

const WELCOME_DIALOGUE: string[] = [
  "Oh! A visitor! Hi there \u{1F44B}",
  "Welcome to zerosicx \u2014 my little corner of the internet.",
  "This is my room. Feel free to look around!",
  "Use the arrow keys to walk, or click somewhere and I'll give you a tour!",
  "Let me know if you find the cat. She's around here somewhere...",
];

/**
 * WelcomeScene
 * Shown only on first visit. Plays a short dialogue, then transitions
 * to BedroomScene and sets the localStorage visited flag.
 */
export class WelcomeScene extends Phaser.Scene {
  private dialogue!: DialogueSystem;
  private lineIndex = 0;
  private titleEl: HTMLElement | null = null;

  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    this.add.rectangle(160, 120, 320, 240, 0x1a0a1a);

    // HTML title — crisp at any zoom, uses Pixelify Sans
    const app = document.getElementById('app');
    if (app) {
      this.titleEl = document.createElement('h1');
      this.titleEl.id = 'welcome-title';
      this.titleEl.textContent = 'zerosicx';
      app.appendChild(this.titleEl);
    }

    // Hide scene label during welcome
    const label = document.getElementById('scene-label');
    if (label) label.textContent = '';

    this.dialogue = new DialogueSystem();
    this.dialogue.show(WELCOME_DIALOGUE[0]);

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    this.input.on('pointerdown', () => this.advance());
  }

  private advance() {
    if (this.dialogue.isTyping()) {
      this.dialogue.skipTyping();
      return;
    }
    this.lineIndex++;
    if (this.lineIndex >= WELCOME_DIALOGUE.length) {
      this.finish();
    } else {
      this.dialogue.show(WELCOME_DIALOGUE[this.lineIndex]);
    }
  }

  private finish() {
    localStorage.setItem('zerosicx_visited', 'true');
    this.dialogue.hide();
    this.titleEl?.remove();
    this.titleEl = null;
    this.scene.start('BedroomScene');
  }
}
