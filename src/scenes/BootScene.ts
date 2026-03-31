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
    this.load.spritesheet('wooden-house', 'assets/sprites/SproutlandTiles/WoodenHouse.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('grass', 'assets/sprites/SproutlandTiles/Grass.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('doors', 'assets/sprites/SproutlandTiles/Doors.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('furniture', 'assets/sprites/Objects/BasicFurniture.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('visitor', 'assets/sprites/Visitor/Visitor.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('cat', 'assets/sprites/Cat/Cat Spritesheet.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('fences', 'assets/sprites/SproutlandTiles/Fences.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('grass-biome', 'assets/sprites/Objects/GrassBiomeThings.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('chest', 'assets/sprites/Objects/Chest.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    const bar = this.add.rectangle(160, 128, 0, 8, 0xf9a8d4);
    this.load.on('progress', (value: number) => {
      bar.width = 200 * value;
    });
  }

  create() {
    const VCOLS = 6;
    const rate = 8;

    const anim = (key: string, row: number, endCol: number, repeat = -1) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('visitor', {
          start: row * VCOLS,
          end: row * VCOLS + endCol,
        }),
        frameRate: rate,
        repeat,
      });
    };

    anim('visitor-idle-forward', 0, 5);
    anim('visitor-idle-right',   1, 5);
    anim('visitor-idle-back',    2, 5);
    anim('visitor-walk-forward', 3, 5);
    anim('visitor-walk-side',    4, 5);
    anim('visitor-walk-back',    5, 5);
    anim('visitor-faint',        9, 3, 0);

    // ── Cat animations (non-contiguous frames: 12 cols in spritesheet) ──
    const CAT_COLS = 12;
    const cf = (row: number, col: number) => row * CAT_COLS + col;

    const catAnim = (key: string, frames: number[], frameRate: number) => {
      this.anims.create({
        key,
        frames: frames.map(f => ({ key: 'cat', frame: f })),
        frameRate,
        repeat: -1,
      });
    };

    catAnim('cat-idle-forward', [cf(1, 1), cf(1, 4)], 3);
    catAnim('cat-idle-back',    [cf(4, 1), cf(4, 4)], 3);
    catAnim('cat-idle-side',    [cf(10, 1), cf(10, 4)], 3);
    catAnim('cat-walk-forward', [cf(1, 7), cf(1, 10)], 6);
    catAnim('cat-walk-back',    [cf(4, 7), cf(4, 10)], 6);
    catAnim('cat-walk-side',    [cf(10, 7), cf(10, 10)], 6);

    const hasVisited = localStorage.getItem('zerosicx_visited');
    if (hasVisited) {
      this.scene.start('BedroomScene');
    } else {
      this.scene.start('WelcomeScene');
    }
  }
}
