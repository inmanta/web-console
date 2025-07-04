import "@testing-library/jest-dom";

/**
 * Sometimes tests can take longer than the default 5000ms timeout.
 * When that happens, the test fails. To prevent the test from failing,
 * we increase the default timeout here.
 */
jest.setTimeout(10000);
//JointJS mock to make library work
window.SVGAngle = jest.fn();

// Collect console warnings and errors
const consoleIssues = [];

// Store original console methods to restore them later
const originalWarn = console.warn;
const originalError = console.error;

// Helper function to format console args
const formatConsoleArgs = (args) => {
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
jest.spyOn(console, "warn").mockImplementation((...args) => {
  consoleIssues.push({
    type: "warn",
    message: formatConsoleArgs(args),
  });

  // Call original implementation
  originalWarn.apply(console, args);
});

jest.spyOn(console, "error").mockImplementation((...args) => {
  consoleIssues.push({
    type: "error",
    message: formatConsoleArgs(args),
  });

  // Call original implementation
  originalError.apply(console, args);
});

// Check for issues after all tests have completed
afterAll(() => {
  // Clear the console spy mocks after all tests
  console.warn.mockClear();
  console.error.mockClear();

  // Fail if any console warnings or errors were detected during test execution
  if (consoleIssues.length > 0) {
    const summary = consoleIssues
      .map(({ type, message }) => {
        const color = type === "warn" ? "\x1b[33m" : "\x1b[31m"; // Yellow for warnings, red for errors
        return `${color}${type.toUpperCase()}: \n${message}\x1b[0m`; // Reset color at end
      })
      .join("\n\n");

    consoleIssues.length = 0; // Clear for next test run

    // Create error object with custom message
    const errorMessage = `\x1b[31mFAILURE: Tests produced the following console warnings/errors:\n\n${summary}\x1b[0m`;
    const error = new Error(errorMessage);

    // Remove this file from the stack trace
    Error.captureStackTrace(error, afterAll);

    throw error;
  }
});
