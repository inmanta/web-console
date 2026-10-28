/**
 * Layout and spacing configuration constants for the Composer
 */

/**
 * Spacing between shapes in the canvas layout
 */
export const HORIZONTAL_SPACING = 420;
export const VERTICAL_SPACING = 200;
export const NESTED_HORIZONTAL_OFFSET = 360;

/**
 * Grid layout constants
 */
export const GRID_COLUMN_WIDTH = HORIZONTAL_SPACING;
export const GRID_ROW_HEIGHT = VERTICAL_SPACING;
export const GRID_START_X = 100;
export const GRID_START_Y = 100;

/**
 * Widths of the composer's flanking panels, shared so the canvas, sidebars and zoom
 * toolbar stay aligned from a single source of truth.
 */
export const LEFT_SIDEBAR_WIDTH = 240;
export const RIGHT_SIDEBAR_WIDTH = 350;

/**
 * The right sidebar sits 1px in from the container edge, so anything aligning to its
 * outer edge needs the width plus that offset.
 */
export const RIGHT_SIDEBAR_OFFSET = RIGHT_SIDEBAR_WIDTH + 1;
