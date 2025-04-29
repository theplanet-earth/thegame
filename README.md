# thegame  
The Planet Game

## Local development environment

This project uses Vite for both development and production previews.

1. **Start your alnoda workspace**  
   If you’re using the ["alnoda" Node.js workspace](https://alnoda.org/registry/workspace/node-js-workspace/v/5-0/), run:

    ```bash
    docker run --name space-1 -d \
      -p 8020-8040:8020-8040 \
      --restart=always \
      alnoda/nodejs-workspace
    ```

2. **Clone the repo**  
    ```bash
    git clone https://github.com/theplanet-earth/thegame.git
    cd thegame
    ```

3. **Install dependencies**  
    ```bash
    npm install playcanvas vite --save-dev
    ```

4. **Run the development server**  
    ```bash
    npx vite --host 0.0.0.0 --port 8026
    ```
    - **What this does**:  
      Spins up Vite’s **dev server** directly from your source files.  
      - Supports **Hot Module Replacement (HMR)** and on-the-fly ESM transforms.  
      - No build step required.  
    - **When to use**: Day-to-day development.

---

## Local test build

To build and preview your production bundle:

1. **Build**  
    ```bash
    npx vite build
    ```

2. **Preview**  
    ```bash
    npx vite preview --host 0.0.0.0 --port 8026
    ```
    - **What this does**:  
      Serves the **already-built** files in `dist/` as if on a production server.  
    - **Why**:  
      Verifies that your final output works before you deploy.

Alternatively, you can build and serve with any static server. For example:

```bash
npx vite build
serve --single dist --listen 8026 --cors
```

then, go for example to: http://localhost:8026/@41.835751,12.496451

## GH Actions

Every time a pull request is merge into the `stage` branch this automatically triggers a gh-action to build `thegame` into the `dist` directory and deploy it to the `gh-pages` branch. This branch is then published and it is reachable at the following URL: https://enjoy.theplanet.wtf/

Pick up a location on earth to start playing, e.g. https://enjoy.theplanet.wtf/@41.835751,12.496451

## Directory tree structure
The directory tree should reflect the separation of concerns and encapsulation of different functionalities. Here’s the current one:

    thegame/
    │
    ├── public/                             # Public assets directory
    │   ├── assets/                         # Static files like textures, models, sounds, etc.
    │   │   └── image.png                   # PNG file accessible at /assets/image.png
    │   ├── example.json                    # JSON file accessible at /example.json
    │   ├── .nojekyll                       # Self-hosting on GitHub pages
    │   └── favicon.ico                     # Favicon file
    │
    ├── src/                                # Source code
    │   ├── core/                           # Core functionality and utility classes
    │   │   ├── engine.ts                   # Initialization and core engine functionality
    │   │   ├── config.ts                   # Game configuration settings
    │   │   └── utility.ts                  # Helper functions and utilities
    │   │           
    │   ├── game/                           # Game specific entities and logic
    │   │   ├── character/                  # Character related classes
    │   │   │   ├── character.ts            # Character logic and behaviors
    │   │   │   └── controller.ts           # Character movement control
    │   │   ├── tiles/                      # Tile management
    │   │   │   ├── tileManager.ts          # Manages loading and unloading of tiles
    │   │   │   ├── tile.ts                 # Individual tile logic
    │   │   │   └── layers/                 # Different layers within a tile
    │   │   │       ├── buildingsLayer.ts
    │   │   │       ├── roadsLayer.ts
    │   │   │       ├── treesLayer.ts
    │   │   │       └── baseLayer.ts        # Base class for all layers
    │   │   |
    │   │   └── gameManager.ts              # Central game logic and state management
    │   └── main.ts                         # Entry point of the application
    │           
    ├── index.html                          # Main HTML file for the project
    ├── vite.config.ts                      # Vite configuration file
    ├── package.json                        # NPM dependencies and scripts
    └── tsconfig.json                       # TypeScript configuration file

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