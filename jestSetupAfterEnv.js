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

// Setup console spies
jest.spyOn(console, "warn").mockImplementation((...args) => {
  // Format the args for better readability
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (_error) {
        return `[${typeof arg}: Circular or complex object]`;
      }
    }
    return String(arg);
  });

  consoleIssues.push({
    type: "warn",
    message: formattedArgs.join(" "),
  });

  // Call original implementation
  originalWarn.apply(console, args);
});

jest.spyOn(console, "error").mockImplementation((...args) => {
  // Format the args for better readability
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (_error) {
        return `[${typeof arg}: Circular or complex object]`;
      }
    }
    return String(arg);
  });

  consoleIssues.push({
    type: "error",
    message: formattedArgs.join(" "),
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
    throw new Error(
      `\x1b[31mFAILURE: Tests produced the following console warnings/errors:\n\n${summary}\x1b[0m`
    );
  }
});
