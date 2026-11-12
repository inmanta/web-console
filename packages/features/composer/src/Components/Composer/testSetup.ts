/* istanbul ignore file */
/**
 * Defines the browser APIs the composer canvas needs that happy-dom doesn't support:
 * React Flow observes the canvas size, and the composer can go fullscreen.
 */
export function defineCanvasTestObjects() {
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    writable: true,
    value: vi.fn(),
  });
  Object.defineProperty(document, "exitFullscreen", {
    writable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: vi.fn().mockImplementation(function () {
      return {
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
      };
    }),
  });
}
