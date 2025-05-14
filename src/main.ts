import { GameManager } from './game/gameManager';

if (__DEBUG__) {
  console.log('%c🚧 DEBUG MODE ACTIVE', 'background: #fdd835; color: black; font-weight: bold; padding: 2px 6px;');
}

// Instantiate the GameManager to start the game
const gameManager = new GameManager();

// After GameManager is fully configured
gameManager.engine.start();
