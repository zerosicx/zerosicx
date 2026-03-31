import Phaser from 'phaser';

const SPEED = 2;

export interface MovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const DEFAULT_BOUNDS: MovementBounds = { minX: 26, maxX: 294, minY: 24, maxY: 232 };

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

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, bounds = DEFAULT_BOUNDS) {
    this.player = player;
    this.bounds = bounds;
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

    if (leftDown) {
      this.player.x = Math.max(this.bounds.minX, this.player.x - SPEED);
      this.direction = 'left';
      moving = true;
    } else if (rightDown) {
      this.player.x = Math.min(this.bounds.maxX, this.player.x + SPEED);
      this.direction = 'right';
      moving = true;
    }

    if (upDown) {
      this.player.y = Math.max(this.bounds.minY, this.player.y - SPEED);
      this.direction = 'up';
      moving = true;
    } else if (downDown) {
      this.player.y = Math.min(this.bounds.maxY, this.player.y + SPEED);
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
        player.setFlipX(true);
        player.play('visitor-walk-side', true);
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
        player.setFlipX(true);
        player.play('visitor-idle-right', true);
        break;
      case 'right':
        player.setFlipX(false);
        player.play('visitor-idle-right', true);
        break;
    }
  }
}
