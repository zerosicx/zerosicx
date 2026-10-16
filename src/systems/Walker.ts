import Phaser from 'phaser';

export type Direction = 'down' | 'up' | 'left' | 'right';
type Point = { x: number; y: number };

/**
 * Walker
 * Moves a non-player sprite along axis-aligned waypoints and keeps its
 * walk/idle animation in sync. Animation keys follow the
 * `${prefix}-${walk|idle}-${forward|back|side}` convention from BootScene.
 */
export class Walker {
  dir: Direction = 'down';
  private path: Point[] = [];
  private resolve: (() => void) | null = null;

  constructor(
    private sprite: Phaser.GameObjects.Sprite,
    private prefix: string,
    private speed: number, // px per ms
  ) {}

  get moving() {
    return this.path.length > 0;
  }

  /** Walk through each point in turn (each leg should be horizontal or vertical). */
  walk(points: Point[]): Promise<void> {
    this.resolve?.();
    this.path = points.filter(p => p.x !== this.sprite.x || p.y !== this.sprite.y);
    if (!this.path.length) {
      this.play('idle');
      return Promise.resolve();
    }
    return new Promise(r => (this.resolve = r));
  }

  face(dir: Direction) {
    this.dir = dir;
    this.play('idle');
  }

  update(delta: number) {
    const target = this.path[0];
    if (!target) return;
    const step = this.speed * delta;
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;

    if (dx !== 0) {
      this.dir = dx > 0 ? 'right' : 'left';
      this.sprite.x += Phaser.Math.Clamp(dx, -step, step);
    } else {
      this.dir = dy > 0 ? 'down' : 'up';
      this.sprite.y += Phaser.Math.Clamp(dy, -step, step);
    }
    this.play('walk');

    if (Math.abs(target.x - this.sprite.x) < 0.01 && Math.abs(target.y - this.sprite.y) < 0.01) {
      this.sprite.setPosition(target.x, target.y);
      this.path.shift();
      if (!this.path.length) {
        this.play('idle');
        const done = this.resolve;
        this.resolve = null;
        done?.();
      }
    }
  }

  play(kind: 'walk' | 'idle') {
    // Prefer dedicated left-facing art when the sheet has it; otherwise mirror the side view.
    const left = `${this.prefix}-${kind}-left`;
    if (this.dir === 'left' && this.sprite.scene.anims.exists(left)) {
      this.sprite.setFlipX(false).play(left, true);
      return;
    }
    const view = this.dir === 'down' ? 'forward' : this.dir === 'up' ? 'back' : 'side';
    this.sprite.setFlipX(this.dir === 'left');
    this.sprite.play(`${this.prefix}-${kind}-${view}`, true);
  }
}
