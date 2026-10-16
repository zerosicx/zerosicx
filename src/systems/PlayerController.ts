import Phaser from 'phaser';
import { StrideAnimator } from './StrideAnimator';

const SPEED = 90;          // px per second at full walking pace
const ACCEL_MS = 90;       // time to ease from standing to full pace
const STRIDE = 7;          // px travelled per walk-cycle frame (stride matching)

export interface MovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const DEFAULT_BOUNDS: MovementBounds = { minX: 26, maxX: 294, minY: 24, maxY: 232 };

/** An axis-aligned blocker in world pixels (fences, furniture footprints). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Sprite centre → bottom of the feet (42 px tall character frames). */
export const PLAYER_FEET = 18;

/** The player's feet, relative to the sprite centre — only the feet collide. */
const FEET = { left: -4, right: 4, top: PLAYER_FEET - 5, bottom: PLAYER_FEET };

type Direction = 'down' | 'up' | 'left' | 'right';

export class PlayerController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.GameObjects.Sprite;
  private bounds: MovementBounds;
  private direction: Direction = 'down';
  private wasMoving = false;
  private _isFainted = false;
  private awaitRelease = false; // resting: ignore keys until they've all been let go
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private colliders: Rect[];
  private stride: StrideAnimator;
  private pace = 0; // 0 → 1 while easing into a walk

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, bounds = DEFAULT_BOUNDS, colliders: Rect[] = []) {
    this.player = player;
    this.bounds = bounds;
    this.colliders = colliders;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };

    this.stride = new StrideAnimator(player, STRIDE);
    this.playIdle();
  }

  get isFainted(): boolean {
    return this._isFainted;
  }

  update(delta = 1000 / 60) {
    const { left, right, up, down } = this.cursors;
    const held = {
      left: left.isDown || this.wasd.left.isDown,
      right: right.isDown || this.wasd.right.isDown,
      up: up.isDown || this.wasd.up.isDown,
      down: down.isDown || this.wasd.down.isDown,
    };
    const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    const dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    const moving = dx !== 0 || dy !== 0;

    if (this._isFainted) {
      // The key that walked her into bed is usually still held: only a fresh
      // press, after every key has been released, wakes her up.
      if (this.awaitRelease) {
        if (!moving) this.awaitRelease = false;
        return;
      }
      if (moving) this._isFainted = false;
      else return;
    }

    if (!moving) {
      // Stop crisply; the next walk starts on a stepping frame.
      if (this.wasMoving) this.playIdle();
      this.wasMoving = false;
      this.pace = 0;
      this.stride.stop();
      return;
    }

    // Facing: keep the current direction while its key is still held (no
    // flicker on diagonals); otherwise face the new way, preferring sideways.
    if (!held[this.direction]) {
      this.direction = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
    }

    // Ease in, then move at a constant speed — the same on every refresh rate
    // and in every direction (diagonals are normalised).
    this.pace = Math.min(1, this.pace + delta / ACCEL_MS);
    const len = Math.hypot(dx, dy);
    const step = (SPEED * this.pace * delta) / 1000;
    const mx = (dx / len) * step;
    const my = (dy / len) * step;

    // Each axis moves separately so the player slides along walls.
    if (mx) this.tryMove(Phaser.Math.Clamp(this.player.x + mx, this.bounds.minX, this.bounds.maxX), this.player.y);
    if (my) this.tryMove(this.player.x, Phaser.Math.Clamp(this.player.y + my, this.bounds.minY, this.bounds.maxY));

    // Legs keep stepping against a wall (as in most top-down games), so the
    // cycle advances by the intended distance, not the distance actually moved.
    this.stride.step(this.walkKey(), step);
    this.wasMoving = true;
  }

  private hits(x: number, y: number) {
    const l = x + FEET.left, r = x + FEET.right, t = y + FEET.top, b = y + FEET.bottom;
    return this.colliders.some(c => l < c.x + c.w && r > c.x && t < c.y + c.h && b > c.y);
  }

  private tryMove(x: number, y: number) {
    // If we somehow start inside a blocker, let the player walk out of it.
    if (!this.hits(x, y) || this.hits(this.player.x, this.player.y)) this.player.setPosition(x, y);
  }

  /** Lie still without the faint animation (e.g. tucked into bed); any movement key wakes her. */
  rest() {
    this._isFainted = true;
    this.awaitRelease = true;
    this.wasMoving = false;
    this.stride.stop();
  }

  faint() {
    this._isFainted = true;
    this.awaitRelease = true;
    this.stride.stop();
    this.player.setFlipX(false);
    this.player.play('visitor-faint');
  }

  private walkKey() {
    return {
      down: 'visitor-walk-forward',
      up: 'visitor-walk-back',
      left: 'visitor-walk-left',
      right: 'visitor-walk-side',
    }[this.direction];
  }

  private playIdle() {
    const { player } = this;
    switch (this.direction) {
      case 'down':
        player.setFlipX(false);
        player.play('visitor-idle-forward', true);
        break;
      case 'up':
        player.setFlipX(false);
        player.play('visitor-idle-back', true);
        break;
      case 'left':
        player.setFlipX(false);
        player.play('visitor-idle-left', true);
        break;
      case 'right':
        player.setFlipX(false);
        player.play('visitor-idle-right', true);
        break;
    }
  }
}
