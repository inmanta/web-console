import '@testing-library/jest-dom';
import moment from 'moment-timezone';
import React from 'react';

import 'jest-axe/extend-expect';

// Import PatternFly CSS to ensure CSS variables are available in tests
import "@patternfly/react-core/dist/styles/base.css";

// Define mocks using vi.hoisted to ensure they're available during hoisting
const logViewerMock = vi.hoisted(() => ({
    LogViewer: ({ data, toolbar, onScroll, hasLineNumbers = false, scrollToRow }) => {
        const handleScroll = (event) => {
            // Use the custom event detail if available, otherwise use default value
            const scrollOffsetToBottom = event?.detail?.scrollOffsetToBottom ?? 100;
            onScroll?.({ scrollOffsetToBottom });
        };

        return React.createElement(
            "div",
            {
                role: "log",
                "data-testid": "log-viewer",
                onScroll: handleScroll,
            },
            toolbar,
            React.createElement("pre", null, data)
        );
    },
    LogViewerSearch: ({ placeholder }) =>
        React.createElement("input", {
            type: "text",
            placeholder: placeholder,
        }),
}));

const codeEditorMock = vi.hoisted(() => ({
    CodeEditor: ({
        code,
        onChange,
        language,
        height,
        isReadOnly,
        isDownloadEnabled,
        isCopyEnabled,
        isLanguageLabelVisible,
        customControls,
        isDarkTheme,
        ...props
    }) => {
        return React.createElement(
            "div",
            { "data-testid": "code-editor", style: { height }, ...props },
            React.createElement("pre", { "data-testid": "code-editor-content" }, code),
            customControls && React.createElement("div", { "data-testid": "code-editor-custom-controls" }, customControls),
            onChange && React.createElement(
                "textarea",
                {
                    "data-testid": "code-editor-textarea",
                    value: code,
                    onChange: (event) => onChange(event.target.value),
                    style: { display: "none" }
                }
            )
        );
    },
    CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel, tooltipProps, ...props }) => React.createElement(
        "button",
        {
            onClick,
            "aria-label": ariaLabel,
            "data-tooltip": tooltipProps?.content,
            ...props
        },
        icon
    ),
    Language: {
        markdown: "markdown",
        json: "json",
        xml: "xml",
        python: "python",
        yaml: "yaml",
        javascript: "javascript",
        typescript: "typescript",
    },
}));

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

// Set window size for tests
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: 1300,
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    value: 800,
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

// Mock @patternfly/react-log-viewer
vi.mock("@patternfly/react-log-viewer", () => logViewerMock);

// Mock @patternfly/react-code-editor
vi.mock("@patternfly/react-code-editor", () => codeEditorMock);

// Mock mermaid
vi.mock("mermaid", () => ({
    default: {
        initialize: vi.fn(),
        render: vi.fn().mockResolvedValue({ svg: "<svg>Mock Mermaid Diagram</svg>" }),
    },
}));
