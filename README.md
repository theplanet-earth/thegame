# thegame
The Planet Game

## Local development environment
To run the game on the ["alnoda" workspace](https://alnoda.org/registry/workspace/node-js-workspace/v/5-0/) dev environment, once the repo has been cloned into this , turn it on with the following command:

    docker run --name space-1 -d -p 8020-8040:8020-8040 --restart=always alnoda/nodejs-workspace

and clone the repo

    git clone https://github.com/theplanet-earth/thegame.git
    
Then, run these commands:

    npm install playcanvas vite --save-dev
    npx vite --host 0.0.0.0 --port 8026

This command starts the Vite development server. It watches your files for changes and provides a fast development environment with hot module replacement (HMR). It's intended for development use, not for serving a production build.

## Local test build

To serve a production build (the files in the dist directory) and simulate how it will behave in a production environment, run this command:

    npx vite preview --host 0.0.0.0 --port 8026

This is useful for locally testing the build output before deploying it to a live server.
To test the build process run the following commands:

    npx vite build  
    serve --single dist --listen 8026 --cors

then, go for example to: http://localhost:8026/@41.835751,12.496451

## Directory tree structure
The directory tree should reflect the separation of concerns and encapsulation of different functionalities. Here’s the current one:

    thegame/
    │
    ├── public/                # Public assets directory
    │   ├── assets/            # Static files like textures, models, sounds, etc.
    │   │   └── image.png      # PNG file accessible at /assets/image.png
    │   ├── example.json       # JSON file accessible at /example.json
    │   ├── .nojekyll          # Self-hosting on GitHub pages
    │   └── favicon.ico        # Favicon file
    │
    ├── src/                      # Source code
    │   ├── core/                 # Core functionality and utility classes
    │   │   ├── engine.ts         # Initialization and core engine functionality
    │   │   ├── config.ts         # Game configuration settings
    │   │   └── utility.ts        # Helper functions and utilities
    │   ├── game/                 # Game specific entities and logic
    │   │   ├── character/        # Character related classes
    │   │   │   ├── character.ts  # Character logic and behaviors
    │   │   │   └── controller.ts # Character movement control
    │   │   ├── tiles/            # Tile management
    │   │   │   ├── tileManager.ts# Manages loading and unloading of tiles
    │   │   │   ├── tile.ts       # Individual tile logic
    │   │   │   └── layers/       # Different layers within a tile
    │   │   │       ├── buildingsLayer.ts
    │   │   │       ├── roadsLayer.ts
    │   │   │       ├── treesLayer.ts
    │   │   │       └── baseLayer.ts   # Base class for all layers
    │   │   └── gameManager.ts    # Central game logic and state management
    │   └── main.ts               # Entry point of the application
    │
    ├── index.html                # Main HTML file for the project
    ├── vite.config.ts            # Vite configuration file
    ├── package.json              # NPM dependencies and scripts
    └── tsconfig.json             # TypeScript configuration file

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