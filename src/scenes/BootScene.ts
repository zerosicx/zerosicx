import Phaser from 'phaser';
import { toFrameMap } from '../data/tilemaps';
import { SakuraCat, SakuraHost, SakuraVisitor } from '../data/sakura-sprites';

export const ROOM_FURNITURE = [
  'bookshelf', 'dresser', 'desk', 'chair', 'bed', 'bed-headboard', 'bed-blanket', 'rug', 'window', 'clock',
  'painting', 'plant', 'cushion',
] as const;

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
    this.load.spritesheet('fences', 'assets/sprites/SproutlandTiles/Fences.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('grass-biome', 'assets/sprites/Objects/GrassBiomeThings.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // ── Generated sakura set (npm run sprites) ──
    const sakura = 'assets/sprites/sakura';
    this.load.spritesheet('sakura-tiles', `${sakura}/tiles.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('sakura-lantern', `${sakura}/lantern.png`, { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('sakura-petals', `${sakura}/petals.png`, { frameWidth: 5, frameHeight: 5 });
    this.load.image('sakura-tree', `${sakura}/tree.png`);
    this.load.image('sakura-glow', `${sakura}/glow.png`);
    this.load.image('sakura-shadow', `${sakura}/shadow.png`);
    this.load.spritesheet('mailbox', `${sakura}/mailbox.png`, { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('visitor', `${sakura}/visitor.png`, { frameWidth: SakuraVisitor.tileSize.w, frameHeight: SakuraVisitor.tileSize.h });
    this.load.spritesheet('host', `${sakura}/host.png`, { frameWidth: SakuraHost.tileSize.w, frameHeight: SakuraHost.tileSize.h });
    this.load.spritesheet('cat', `${sakura}/cat.png`, { frameWidth: SakuraCat.tileSize.w, frameHeight: SakuraCat.tileSize.h });
    this.load.spritesheet('sakura-room', `${sakura}/room.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('computer', `${sakura}/computer.png`, { frameWidth: 26, frameHeight: 24 });
    this.load.spritesheet('door-room', `${sakura}/door-room.png`, { frameWidth: 32, frameHeight: 16 });
    this.load.spritesheet('door-garden', `${sakura}/door-garden.png`, { frameWidth: 32, frameHeight: 16 });
    for (const name of ROOM_FURNITURE) this.load.image(`room-${name}`, `${sakura}/room-${name}.png`);

    const bar = this.add.rectangle(160, 128, 0, 8, 0xf9a8d4);
    this.load.on('progress', (value: number) => {
      bar.width = 200 * value;
    });
  }

  create() {
    // Build an animation from generated frame names, e.g. seq('visitor', VF, 'idle_front', [0, 1]).
    const seq = (key: string, sheet: string, map: Record<string, number>, prefix: string, order: number[], frameRate: number, repeat = -1) => {
      this.anims.create({
        key,
        frames: order.map(i => ({ key: sheet, frame: map[`${prefix}_${i}`] })),
        frameRate,
        repeat,
      });
    };
    const IDLE = [0, 1, 0, 1, 0, 1, 3, 0]; // breathe, breathe, blink
    const WALK = [0, 1, 2, 3];

    // ── Visitor (player) ──
    const VF = toFrameMap(SakuraVisitor);
    seq('visitor-idle-forward', 'visitor', VF, 'idle_front', IDLE, 3);
    seq('visitor-idle-right',   'visitor', VF, 'idle_side',  [0, 1, 2, 3], 2);
    seq('visitor-idle-left',    'visitor', VF, 'idle_left',  [0, 1, 2, 3], 2);
    seq('visitor-idle-back',    'visitor', VF, 'idle_back',  [0, 1, 2, 3], 2);
    seq('visitor-walk-forward', 'visitor', VF, 'walk_front', WALK, 8);
    seq('visitor-walk-side',    'visitor', VF, 'walk_side',  WALK, 8);
    seq('visitor-walk-left',    'visitor', VF, 'walk_left',  WALK, 8);
    seq('visitor-walk-back',    'visitor', VF, 'walk_back',  WALK, 8);
    seq('visitor-faint',        'visitor', VF, 'faint',      [0, 1, 2, 3], 6, 0);

    // ── Host (the site owner's character) ──
    const HF = toFrameMap(SakuraHost);
    seq('host-idle-forward', 'host', HF, 'idle_front', IDLE, 3);
    seq('host-idle-side',    'host', HF, 'idle_side',  [0, 1, 2, 3], 2);
    seq('host-idle-left',    'host', HF, 'idle_left',  [0, 1, 2, 3], 2);
    seq('host-idle-back',    'host', HF, 'idle_back',  [0, 1, 2, 3], 2);
    seq('host-walk-forward', 'host', HF, 'walk_front', WALK, 7);
    seq('host-walk-side',    'host', HF, 'walk_side',  WALK, 7);
    seq('host-walk-left',    'host', HF, 'walk_left',  WALK, 7);
    seq('host-walk-back',    'host', HF, 'walk_back',  WALK, 7);
    seq('host-type',         'host', HF, 'sit',        [0, 1, 0, 1, 2, 2], 5);

    // ── Bengal cat ──
    const CF = toFrameMap(SakuraCat);
    seq('cat-idle-forward', 'cat', CF, 'idle_front', IDLE, 3);
    seq('cat-idle-side',    'cat', CF, 'idle_side',  IDLE, 3);
    seq('cat-idle-left',    'cat', CF, 'idle_left',  [0], 1);
    seq('cat-idle-back',    'cat', CF, 'idle_back',  [0, 0, 0, 1], 2);
    seq('cat-walk-forward', 'cat', CF, 'walk_front', WALK, 8);
    seq('cat-walk-side',    'cat', CF, 'walk_side',  WALK, 8);
    seq('cat-walk-left',    'cat', CF, 'walk_left',  WALK, 8);
    seq('cat-walk-back',    'cat', CF, 'walk_back',  WALK, 8);
    seq('cat-sleep',        'cat', CF, 'sleep',      [0, 1], 1);

    // ── Sakura animations ──
    this.anims.create({
      key: 'lantern-flicker',
      frames: this.anims.generateFrameNumbers('sakura-lantern', { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: 'petal-tumble',
      frames: this.anims.generateFrameNumbers('sakura-petals', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    const hasVisited = localStorage.getItem('zerosicx_visited');
    if (hasVisited) {
      this.scene.start('BedroomScene');
    } else {
      this.scene.start('WelcomeScene');
    }
  }
}
