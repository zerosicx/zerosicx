import Phaser from 'phaser';

/**
 * BootScene
 * First scene to run. Preloads all assets, then checks localStorage
 * to decide whether to show the Welcome dialogue or go straight to the Bedroom.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // ─── Load assets here as you create them ───────────────────────────
    // Example (once you have sprites):
    //   this.load.image('tiles-bedroom', 'assets/tilesets/bedroom.png');
    //   this.load.tilemapTiledJSON('map-bedroom', 'maps/bedroom.tmj');
    //   this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });

    // Loading bar (placeholder)
    const bar = this.add.rectangle(160, 128, 0, 8, 0xf9a8d4);
    this.load.on('progress', (value: number) => {
      bar.width = 200 * value;
    });
  }

  create() {
    const hasVisited = localStorage.getItem('zerosicx_visited');
    if (hasVisited) {
      this.scene.start('BedroomScene');
    } else {
      this.scene.start('WelcomeScene');
    }
  }
}
