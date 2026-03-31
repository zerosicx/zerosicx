import Phaser from 'phaser';

const SPEED = 2; // pixels per frame at 60fps ≈ 2–3 tiles/sec (tile = 16px)
const BOUNDS = { minX: 10, maxX: 310, minY: 20, maxY: 235 };

/**
 * PlayerController
 * Handles arrow-key movement for the player character.
 * Click-to-walk pathfinding will be added in Phase 2 once
 * Tiled collision layers are in place.
 */
export class PlayerController {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.GameObjects.Rectangle;
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Rectangle) {
    this.player = player;
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
  }

  update() {
    const { left, right, up, down } = this.cursors;
    const leftDown = left.isDown || this.wasd.left.isDown;
    const rightDown = right.isDown || this.wasd.right.isDown;
    const upDown = up.isDown || this.wasd.up.isDown;
    const downDown = down.isDown || this.wasd.down.isDown;

    if (leftDown) {
      this.player.x = Math.max(BOUNDS.minX, this.player.x - SPEED);
    } else if (rightDown) {
      this.player.x = Math.min(BOUNDS.maxX, this.player.x + SPEED);
    }

    if (upDown) {
      this.player.y = Math.max(BOUNDS.minY, this.player.y - SPEED);
    } else if (downDown) {
      this.player.y = Math.min(BOUNDS.maxY, this.player.y + SPEED);
    }
  }
}
