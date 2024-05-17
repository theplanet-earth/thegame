# thegame
The Planet Game

## Local environment
To run the game on a dev environment, once the repo has been cloned into this ["alnoda" workspace](https://alnoda.org/registry/workspace/node-js-workspace/v/5-0/) run the following commands:

    npm install playcanvas vite --save-dev
    npx vite --host 0.0.0.0 --port 8026

remember to turn on the environment with the following command:

    docker run --name space-1 -d -p 8020-8040:8020-8040 --restart=always alnoda/nodejs-workspace

then, for example, go to http://localhost:8026/@41.835751,12.496451

## Directory Tree
The directory tree should reflect the separation of concerns and encapsulation of different functionalities. Here’s the current one:

    src/
    │
    ├── assets/                 # Static files like textures, models, sounds, etc.
    │
    ├── core/                   # Core functionality and utility classes
    │   ├── engine.ts           # Initialization and core engine functionality
    │   ├── config.ts           # Game configuration settings
    │   └── utility.ts          # Helper functions and utilities
    │
    ├── game/                   # Game specific entities and logic
    │   ├── character/          # Character related classes
    │   │   ├── character.ts    # Character logic and behaviors
    │   │   └── controller.ts   # Character movement control
    │   │
    │   ├── tiles/              # Tile management
    │   │   ├── tileManager.ts  # Manages loading and unloading of tiles
    │   │   ├── tile.ts         # Individual tile logic
    │   │   └── layers/         # Different layers within a tile
    │   │       ├── buildingsLayer.ts
    │   │       ├── roadsLayer.ts
    │   │       ├── treesLayer.ts
    │   │       └── baseLayer.ts   # Base class for all layers
    │   │
    │   └── gameManager.ts      # Central game logic and state management
    │
    └── main.ts                # Entry point of the application

## Naming Conventions
For this project (and in general TypeScript, modern JavaScript environments), follow these naming conventions:

- Directories: Use lowerCamelCase for directories if they represent a specific functionality otherwise, normal lowercase is preferred to keep it simple.
- Files: Files should be named in PascalCase if they define a class (e.g., Character.ts, TileManager.ts), or camelCase for those handling utility functions or configurations (config.ts, utility.ts).
- Classes & Interfaces: Use PascalCase (e.g., class GameManager).
- Variables & Functions: Use lowerCamelCase (e.g., let gameManager and function manageGame()).
- Constants: Use UPPER_SNAKE_CASE (e.g., const MAX_TILES).

## Additional Best Practices
- Modular Design: Keep your code modular. This helps in managing dependencies and makes unit testing easier.
- Use TypeScript Features: Leverage interfaces and types for better compile-time checks and clearer code contracts.
- Asynchronous Loading: Since you're loading assets at runtime, ensure your asset management is efficient. Use Promises, async/await for handling asynchronous operations neatly.
- Error Handling: Have robust error handling especially around loading/unloading of assets.
- Documentation: Comment your code where necessary, especially for parts where the logic isn’t straightforward. Use JSDoc for automated documentation generation.
- Configurability: Place configurable parameters (like the number of tiles) in a separate config file or environment settings.