import Phaser from 'phaser';

const SPEED = 2;

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
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private colliders: Rect[];

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

    this.playIdle();
  }

  get isFainted(): boolean {
    return this._isFainted;
  }

  update() {
    const { left, right, up, down } = this.cursors;
    const leftDown = left.isDown || this.wasd.left.isDown;
    const rightDown = right.isDown || this.wasd.right.isDown;
    const upDown = up.isDown || this.wasd.up.isDown;
    const downDown = down.isDown || this.wasd.down.isDown;
    const anyDown = leftDown || rightDown || upDown || downDown;

    if (this._isFainted) {
      if (anyDown) this._isFainted = false;
      else return;
    }

    let moving = false;

    // Each axis moves separately so the player slides along walls.
    if (leftDown) {
      this.tryMove(Math.max(this.bounds.minX, this.player.x - SPEED), this.player.y);
      this.direction = 'left';
      moving = true;
    } else if (rightDown) {
      this.tryMove(Math.min(this.bounds.maxX, this.player.x + SPEED), this.player.y);
      this.direction = 'right';
      moving = true;
    }

    if (upDown) {
      this.tryMove(this.player.x, Math.max(this.bounds.minY, this.player.y - SPEED));
      this.direction = 'up';
      moving = true;
    } else if (downDown) {
      this.tryMove(this.player.x, Math.min(this.bounds.maxY, this.player.y + SPEED));
      this.direction = 'down';
      moving = true;
    }

    if (moving && !this.wasMoving) {
      this.playWalk();
    } else if (!moving && this.wasMoving) {
      this.playIdle();
    } else if (moving && this.wasMoving) {
      this.playWalk();
    }
    this.wasMoving = moving;
  }

  private hits(x: number, y: number) {
    const l = x + FEET.left, r = x + FEET.right, t = y + FEET.top, b = y + FEET.bottom;
    return this.colliders.some(c => l < c.x + c.w && r > c.x && t < c.y + c.h && b > c.y);
  }

  private tryMove(x: number, y: number) {
    // If we somehow start inside a blocker, let the player walk out of it.
    if (!this.hits(x, y) || this.hits(this.player.x, this.player.y)) this.player.setPosition(x, y);
  }

  faint() {
    this._isFainted = true;
    this.player.setFlipX(false);
    this.player.play('visitor-faint');
  }

  private playWalk() {
    const { player } = this;
    switch (this.direction) {
      case 'down':
        player.setFlipX(false);
        player.play('visitor-walk-forward', true);
        break;
      case 'up':
        player.setFlipX(false);
        player.play('visitor-walk-back', true);
        break;
      case 'left':
        player.setFlipX(false);
        player.play('visitor-walk-left', true);
        break;
      case 'right':
        player.setFlipX(false);
        player.play('visitor-walk-side', true);
        break;
    }
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
