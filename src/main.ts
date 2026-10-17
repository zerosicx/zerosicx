import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WelcomeScene } from './scenes/WelcomeScene';
import { BedroomScene } from './scenes/BedroomScene';
import { GardenScene } from './scenes/GardenScene';
import { mountGamepad } from './systems/Gamepad';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'screen',
  // 320×240, scaled to fill #screen: 960×720 on desktop, the Game Boy screen on phones
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 240,
  },
  pixelArt: true,    // disables anti-aliasing on all textures
  antialias: false,
  roundPixels: true,
  backgroundColor: '#f8ddea',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, WelcomeScene, BedroomScene, GardenScene],
};

mountGamepad();
const game = new Phaser.Game(config);

// Dev-only handle for debugging from the console, e.g. game.scene.start('GardenScene')
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
