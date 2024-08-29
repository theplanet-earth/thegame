import { GameManager } from './game/gameManager';

// Instantiate the GameManager to start the game
const gameManager = new GameManager();

// After GameManager is fully configured
gameManager.engine.start();