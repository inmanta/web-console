/* istanbul ignore file */
/**
 * Defines objects for JointJS.
 * This function sets up mock implementations for various properties and methods used by JointJS library that aren't supported by default in the Jest environment.
 */
export function defineObjectsForJointJS() {
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    writable: true,
    value: vi.fn(),
  });
  Object.defineProperty(document, "exitFullscreen", {
    writable: true,
    value: vi.fn(),
  });
  // Safely mock SVGAngle
  const svgAngleDescriptor = Object.getOwnPropertyDescriptor(window, "SVGAngle");
  if (!svgAngleDescriptor || svgAngleDescriptor.configurable) {
    Object.defineProperty(window, "SVGAngle", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        new: vi.fn(),
        prototype: vi.fn(),
        SVG_ANGLETYPE_UNKNOWN: 0,
        SVG_ANGLETYPE_UNSPECIFIED: 1,
        SVG_ANGLETYPE_DEG: 2,
        SVG_ANGLETYPE_RAD: 3,
        SVG_ANGLETYPE_GRAD: 4,
      })),
    });
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    })),
  });
  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGMatrix", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      martix: vi.fn(() => [[]]),
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
      flipX: vi.fn().mockImplementation(() => global.SVGSVGElement),
      flipY: vi.fn().mockImplementation(() => global.SVGSVGElement),
      inverse: vi.fn().mockImplementation(() => global.SVGSVGElement),
      multiply: vi.fn().mockImplementation(() => global.SVGSVGElement),
      rotate: vi.fn().mockImplementation(() => global.SVGSVGElement),
      rotateFromVector: vi.fn().mockImplementation(() => global.SVGSVGElement),
      scale: vi.fn().mockImplementation(() => global.SVGSVGElement),
      scaleNonUniform: vi.fn().mockImplementation(() => global.SVGSVGElement),
      skewX: vi.fn().mockImplementation(() => global.SVGSVGElement),
      skewY: vi.fn().mockImplementation(() => global.SVGSVGElement),
      translate: vi.fn().mockImplementation(() => ({
        multiply: vi.fn().mockImplementation(() => ({
          multiply: vi.fn().mockImplementation(() => ({
            inverse: vi.fn().mockImplementation(() => global.SVGSVGElement),
          })),
        })),
        rotate: vi.fn().mockImplementation(() => ({
          translate: vi.fn().mockImplementation(() => ({
            rotate: vi.fn().mockImplementation(() => ({
              translate: vi.fn().mockImplementation(() => global.SVGSVGElement),
            })),
          })),
        })),
      })),
    })),
  });

  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGPoint", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      matrixTransform: vi.fn().mockImplementation(() => ({
        x: 0,
        y: 0,
      })),
    })),
  });

  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGTransform", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      angle: 0,
      matrix: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        multiply: vi.fn(),
      },
      setMatrix: vi.fn(),
      setTranslate: vi.fn(),
    })),
  });
  // @ts-expect-error SVGPathElement is not defined in jsdom
  window.SVGPathElement = vi.fn();

  Object.defineProperty(global.SVGElement.prototype, "getComputedTextLength", {
    writable: true,
    value: vi.fn().mockReturnValue(0),
  });

  Object.defineProperty(global.SVGElement.prototype, "getBBox", {
    writable: true,
    value: vi.fn().mockReturnValue({
      x: 0,
      y: 0,
    }),
  });

  Object.defineProperty(global.SVGElement.prototype, "getScreenCTM", {
    writable: true,
    value: vi.fn().mockReturnValue(0),
  });

  Object.defineProperty(Document.prototype, "elementFromPoint", {
    writable: true,
    value: vi.fn().mockReturnValue(null),
  });
}

