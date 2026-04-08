import Phaser from 'phaser';
import { Cat, Visitor, toFrameMap } from '../data/tilemaps';

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
    const VF = toFrameMap(Visitor);
    const CF = toFrameMap(Cat);
    const rate = 8;

    const anim = (key: string, start: number, end: number, repeat = -1) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('visitor', { start, end }),
        frameRate: rate,
        repeat,
      });
    };

    anim('visitor-idle-forward', VF.visitor_idle_0_0,          VF.visitor_idle_0_5);
    anim('visitor-idle-right',   VF.visitor_idle_right_0_0,    VF.visitor_idle_right_0_5);
    anim('visitor-idle-back',    VF.visitor_idle_back_0_0,     VF.visitor_idle_back_0_5);
    anim('visitor-walk-forward', VF.visitor_walk_forward_0_0,  VF.visitor_walk_forward_0_5);
    anim('visitor-walk-side',    VF.visitor_walk_side_0_0,     VF.visitor_walk_side_0_5);
    anim('visitor-walk-back',    VF.visitor_walk_back_0_0,     VF.visitor_walk_back_0_5);
    anim('visitor-faint',        VF.visitor_faint_0_0,         VF.visitor_faint_0_3, 0);

    // ── Cat animations (non-contiguous frames) ──
    const catAnim = (key: string, frames: number[], frameRate: number) => {
      this.anims.create({
        key,
        frames: frames.map(f => ({ key: 'cat', frame: f })),
        frameRate,
        repeat: -1,
      });
    };

    catAnim('cat-idle-forward', [CF.cat_idle_1, CF.cat_idle_2], 3);
    catAnim('cat-idle-back',    [CF.cat_back_idle_1, CF.cat_back_idle_2], 3);
    catAnim('cat-idle-side',    [CF.cat_idle_right_1, CF.cat_idle_right_2], 3);
    catAnim('cat-walk-forward', [CF.cat_walk_left_foot, CF.cat_walk_right_foot], 6);
    catAnim('cat-walk-back',    [CF.cat_walk_back_left_foot, CF.cat_walk_back_right_foot], 6);
    catAnim('cat-walk-side',    [CF.cat_walk_right_left_foot, CF.cat_walk_right_right_foot], 6);

    const hasVisited = localStorage.getItem('zerosicx_visited');
    if (hasVisited) {
      this.scene.start('BedroomScene');
    } else {
      this.scene.start('WelcomeScene');
    }
  }
}
