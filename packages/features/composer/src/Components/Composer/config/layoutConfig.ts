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
 * Spacing of the layered layout: between two layers, and between two shapes in a layer
 */
export const LAYER_SPACING = 120;
export const SIBLING_SPACING = 40;

/**
 * Widths of the composer's flanking panels, shared so the canvas, sidebars and zoom
 * toolbar stay aligned from a single source of truth.
 */
export const LEFT_SIDEBAR_WIDTH = 288;
export const RIGHT_SIDEBAR_WIDTH = 360;

/**
 * The right sidebar sits 1px in from the container edge, so anything aligning to its
 * outer edge needs the width plus that offset.
 */
export const RIGHT_SIDEBAR_OFFSET = RIGHT_SIDEBAR_WIDTH + 1;

/**
 * The composer fills the page down to the bottom of the window, but never gets lower than
 * this: a shorter window scrolls the page instead.
 */
export const COMPOSER_MIN_HEIGHT = 400;
