import Phaser from 'phaser';

/**
 * StrideAnimator
 * Distance-driven walk animation ("stride matching"): the walk cycle advances
 * one frame for every `stride` pixels actually travelled, instead of at a
 * fixed frame rate. Feet then plant where the ground is — no skating when
 * walking slowly, no frantic stepping when fast — and the cycle pauses in
 * place if movement stops.
 *
 * The cycle's phase carries over when the direction changes, so turning
 * mid-walk continues the step rather than restarting it.
 */
export class StrideAnimator {
  private distance = 0;
  private key = '';

  constructor(private sprite: Phaser.GameObjects.Sprite, private stride: number) {}

  /** Show the walk frame for `key` after travelling `moved` more pixels. */
  step(key: string, moved: number, flipX = false) {
    const anim = this.sprite.scene.anims.get(key);
    if (!anim) return;
    if (key !== this.key) {
      this.key = key;
      this.sprite.play(key);
      this.sprite.anims.pause();
    }
    this.sprite.setFlipX(flipX);
    this.distance += moved;
    const i = Math.floor(this.distance / this.stride) % anim.frames.length;
    this.sprite.anims.setCurrentFrame(anim.frames[i]);
  }

  /** Forget the walk; the next step starts a fresh cycle on a stepping frame. */
  stop() {
    this.key = '';
    this.distance = 0;
  }
}
