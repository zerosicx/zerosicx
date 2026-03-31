import Phaser from 'phaser';
import { DialogueSystem } from '../systems/DialogueSystem';

const WELCOME_DIALOGUE: string[] = [
  "Oh! A visitor! Hi there \u{1F44B}",
  "Welcome to zerosicx \u2014 my little corner of the internet.",
  "This is my room. Feel free to look around!",
  "Use the arrow keys to walk, or click somewhere and I'll head over.",
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

  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    // Dark background
    this.add.rectangle(160, 120, 320, 240, 0x1a0a1a);

    // Subtle "zerosicx" title
    this.add.text(160, 80, 'zerosicx', {
      fontSize: '16px',
      color: '#f9a8d4',
      fontFamily: 'Courier New',
      resolution: 3,
    }).setOrigin(0.5);

    this.dialogue = new DialogueSystem();
    this.dialogue.show(WELCOME_DIALOGUE[0]);

    // Advance on Space, Enter, or click
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
    this.scene.start('BedroomScene');
  }
}
