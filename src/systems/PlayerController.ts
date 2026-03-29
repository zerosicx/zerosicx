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

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Rectangle) {
    this.player = player;
    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  update() {
    const { left, right, up, down } = this.cursors;

    if (left.isDown) {
      this.player.x = Math.max(BOUNDS.minX, this.player.x - SPEED);
    } else if (right.isDown) {
      this.player.x = Math.min(BOUNDS.maxX, this.player.x + SPEED);
    }

    if (up.isDown) {
      this.player.y = Math.max(BOUNDS.minY, this.player.y - SPEED);
    } else if (down.isDown) {
      this.player.y = Math.min(BOUNDS.maxY, this.player.y + SPEED);
    }
  }
}
