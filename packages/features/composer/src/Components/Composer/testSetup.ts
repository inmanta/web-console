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

/** The size of every element in the canvas tests: a card's width, and about a card's height. */
const ELEMENT_SIZE = { width: 280, height: 80 };

/**
 * Lays out the canvas in the component tests, as far as React Flow needs. happy-dom has no layout:
 * every element is 0 by 0, so React Flow would never measure a card and keep them all hidden.
 * Every element gets a size instead, and the ResizeObserver reports each element it observes once,
 * the way React Flow measures its cards. SVG text gets a box too, for the lines' labels.
 */
export function defineReactFlowTestObjects() {
  class ImmediateResizeObserver {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback([{ target } as ResizeObserverEntry], this);
    }

    // Each element is reported once, when it is observed: there is nothing to stop
    unobserve() {
      return undefined;
    }

    disconnect() {
      return undefined;
    }
  }

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ImmediateResizeObserver,
  });
  Object.defineProperties(HTMLElement.prototype, {
    offsetWidth: {
      configurable: true,
      get() {
        return ELEMENT_SIZE.width;
      },
    },
    offsetHeight: {
      configurable: true,
      get() {
        return ELEMENT_SIZE.height;
      },
    },
  });
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    writable: true,
    configurable: true,
    value: () => ({ x: 0, y: 0, ...ELEMENT_SIZE }),
  });
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    writable: true,
    configurable: true,
    value: vi.fn(),
  });
}
