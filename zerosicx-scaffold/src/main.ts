import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WelcomeScene } from './scenes/WelcomeScene';
import { BedroomScene } from './scenes/BedroomScene';
import { GardenScene } from './scenes/GardenScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 320,
  height: 240,
  zoom: 3,           // scales 320x240 → 960x720 (crisp pixel art)
  pixelArt: true,    // disables anti-aliasing on all textures
  backgroundColor: '#1a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, WelcomeScene, BedroomScene, GardenScene],
};

new Phaser.Game(config);
