import "vitest";
import type { DetachedWindowAPI } from "happy-dom";

declare global {
  /**
   * happy-dom exposes its settings and control API on the test window as `window.happyDOM`.
   */
  interface Window {
    happyDOM: DetachedWindowAPI;
  }
}

interface CustomMatchers<R = unknown> {
  toHaveNoViolations: () => R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown> extends CustomMatchers<T> {}
}
