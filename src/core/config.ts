// Define interfaces for better type-checking
export interface MovementConfig {
    speed: number;
    rotateSpeed: number;
    zoomSpeed: number;
}

// Movement details
export const DEFAULT_MOVEMENT_CONFIG: MovementConfig = {
    speed: 1.5,
    rotateSpeed: 25,
    zoomSpeed: 20
};

export const CAMERA_CLEAR_COLOR = { r: 0.3, g: 0.3, b: 0.7 };
export const BOX_COLOR = { r: 0.5, g: 1, b: 0.5 }; // Acid Green
export const TILE_BOUNDARY_THRESHOLD = 5;