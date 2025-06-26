import 'vitest'

interface CustomMatchers<R = unknown> {
    toHaveNoViolations: () => R
}

declare module 'vitest' {
    interface Matchers<T = any> extends CustomMatchers<T> { }
} 