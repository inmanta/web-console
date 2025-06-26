import '@testing-library/jest-dom';
import moment from 'moment-timezone';
import { toHaveNoViolations } from "jest-axe";

import 'jest-axe/extend-expect';



// Set default timezone
moment.tz.setDefault('Europe/Brussels');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// JointJS mock
Object.defineProperty(window, 'SVGAngle', {
    value: vi.fn(),
});

// Set test timeout
vi.setConfig({ testTimeout: 10000 });

// Collect console warnings and errors
const consoleIssues: Array<{ type: 'warn' | 'error'; message: string }> = [];

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to format console args
const formatConsoleArgs = (args: any[]) => {
    return args
        .map((arg) => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (_error) {
                    return `[${typeof arg}: Circular or complex object]`;
                }
            }
            return String(arg);
        })
        .join(' ');
};

// Setup console spies
vi.spyOn(console, 'warn').mockImplementation((...args) => {
    consoleIssues.push({
        type: 'warn',
        message: formatConsoleArgs(args),
    });
    originalWarn.apply(console, args);
});

vi.spyOn(console, 'error').mockImplementation((...args) => {
    consoleIssues.push({
        type: 'error',
        message: formatConsoleArgs(args),
    });
    originalError.apply(console, args);
});
