// Wrap in before() to ensure it runs before any test
beforeEach(() => {
  cy.on("uncaught:exception", (err) => {
    // Only ignore the specific Monaco editor disposal error
    console.log(err.message);

    if (err.message.includes("TextModel")) {
      return false; // Prevents the error from failing tests
    }

    // Benign browser notification, not an application error: PatternFly's CodeEditor
    // re-layouts Monaco from a ResizeObserver (since PF 6.7) while Monaco's automaticLayout
    // observes the same element, e.g. when switching away from a tab with code editors.
    if (err.message.includes("ResizeObserver loop")) {
      return false;
    }

    // Allow other uncaught exceptions to fail tests
    return true;
  });

  localStorage.setItem("theme-preference", "light");
});
