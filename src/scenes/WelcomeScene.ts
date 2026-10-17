import Phaser from 'phaser';
import { DialogueSystem } from '../systems/DialogueSystem';
import { isTouchDevice, onPadButton } from '../systems/Gamepad';

const WELCOME_DIALOGUE: string[] = [
  "Oh! A visitor! Hi there \u{1F44B}",
  "Welcome to zerosicx \u2014 my little corner of the internet.",
  "This is my room. Feel free to look around!",
  isTouchDevice()
    ? 'Walk with the D-pad, press A to say hi or look at things, and B to back out!'
    : 'Walk with the arrow keys, press Space to say hi or look at things, and Esc to back out!',
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
  private finished = false;

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

    // A (or a tap) reads on; B skips the intro
    const offA = onPadButton('A', () => this.advance());
    const offB = onPadButton('B', () => this.finish());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { offA(); offB(); });
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
    if (this.finished) return;
    this.finished = true;
    localStorage.setItem('zerosicx_visited', 'true');
    this.dialogue.hide();
    this.titleEl?.remove();
    this.titleEl = null;
    this.scene.start('BedroomScene');
  }
}
