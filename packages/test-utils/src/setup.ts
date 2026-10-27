import "@testing-library/jest-dom/vitest";
import React from "react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Messages, registerMessages } from "@inmanta/web-console-core/I18n/Words";
import dayjs from "@inmanta/web-console-core/dayjs";

import "jest-axe/extend-expect";

// Register the English messages of every layer and feature, as the shell does when the app starts.
const messageModules = import.meta.glob<Record<string, Messages>>(
  ["/src/**/messages.{ts,tsx}", "/packages/**/messages.{ts,tsx}"],
  { eager: true }
);
Object.values(messageModules).forEach((module) => Object.values(module).forEach(registerMessages));

// Define mocks using vi.hoisted to ensure they're available during hoisting
const logViewerMock = vi.hoisted(() => ({
  LogViewer: ({ data, toolbar, onScroll, _hasLineNumbers = false, _scrollToRow }) => {
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
    _language,
    height,
    _isReadOnly,
    _isDownloadEnabled,
    _isCopyEnabled,
    _isLanguageLabelVisible,
    customControls,
    _isDarkTheme,
    ...props
  }) => {
    return React.createElement(
      "div",
      { "data-testid": "code-editor", style: { height }, ...props },
      React.createElement("pre", { "data-testid": "code-editor-content" }, code),
      customControls &&
        React.createElement(
          "div",
          { "data-testid": "code-editor-custom-controls" },
          customControls
        ),
      onChange &&
        React.createElement("textarea", {
          "data-testid": "code-editor-textarea",
          value: code,
          onChange: (event) => onChange((event.target as HTMLTextAreaElement).value),
          style: { display: "none" },
        })
    );
  },
  CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel, tooltipProps, ...props }) =>
    React.createElement(
      "button",
      {
        onClick,
        "aria-label": ariaLabel,
        "data-tooltip": tooltipProps?.content,
        ...props,
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

// Composer mocks - must use function (not arrow) for Vitest 4 constructor compatibility
const linkShapeMock = vi.hoisted(() => ({
  LinkShape: vi.fn().mockImplementation(function () {
    return {
      source: vi.fn().mockReturnThis(),
      target: vi.fn().mockReturnThis(),
      router: vi.fn().mockReturnThis(),
      connector: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    };
  }),
}));

// Give the Monaco loader the mocked monaco-editor, like src/index.tsx gives it the bundled copy,
// so editors load without fetching the loader script from the CDN.
loader.config({ monaco });

// Fix timezone to Europe/Brussels for all tests so date-related assertions are deterministic.
vi.spyOn(dayjs.tz, "guess").mockReturnValue("Europe/Brussels");

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: light)",
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Requests that no msw handler answers, such as query retries after a test file's server closed,
// would reach a real server on localhost. Answer them with a network error instead.
window.happyDOM.settings.fetch.interceptor = {
  beforeAsyncRequest: async ({ request, window }) =>
    request.url.startsWith("http") ? window.Response.error() : undefined,
};

// happy-dom's default stylesheet lacks two browser rules: spans get no display instead of inline,
// and [hidden] elements stay displayed. Accessible names and axe checks rely on both.
const userAgentStyles = document.createElement("style");

userAgentStyles.textContent = "span { display: inline; } [hidden] { display: none; }";
document.head.append(userAgentStyles);

// Set window size for tests
Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1300,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  value: 800,
});

// Set test timeout
vi.setConfig({ testTimeout: 25000 });

// Collect console warnings and errors
const consoleIssues: Array<{ type: "warn" | "error"; message: string }> = [];

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to format console args
const formatConsoleArgs = (args: unknown[]) => {
  return args
    .map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (_error) {
          return `[${typeof arg}: Circular or complex object]`;
        }
      }

      return String(arg);
    })
    .join(" ");
};

// Setup console spies
vi.spyOn(console, "warn").mockImplementation((...args) => {
  consoleIssues.push({
    type: "warn",
    message: formatConsoleArgs(args),
  });
  originalWarn.apply(console, args);
});

vi.spyOn(console, "error").mockImplementation((...args) => {
  consoleIssues.push({
    type: "error",
    message: formatConsoleArgs(args),
  });
  originalError.apply(console, args);
});

// Mock @patternfly/react-log-viewer
vi.mock("@patternfly/react-log-viewer", () => logViewerMock);

// Mock @patternfly/react-code-editor
vi.mock("@patternfly/react-code-editor", () => codeEditorMock);

// Mock Composer LinkShape (used by linkUtils, initializeCanvasFromInstance, and other Composer tests)
vi.mock("@/UI/Components/Composer/UI/JointJsShapes/LinkShape", () => linkShapeMock);

// Mock mermaid
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: "<svg>Mock Mermaid Diagram</svg>" }),
    run: vi.fn().mockResolvedValue(undefined),
    init: vi.fn(),
  },
}));
