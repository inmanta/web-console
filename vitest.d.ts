import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveNoViolations: () => R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown> extends CustomMatchers<T> { }
}
