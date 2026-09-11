import "./monacoHelpers.js";

// Cypress 16 changed the cy.type() keystrokeDelay default from 10ms to 0ms. Typing with no
// delay fires keystrokes fast enough to make some PatternFly forms re-render in a tight burst,
// which tips the Popper used by field tooltips into a React "maximum update depth" crash (the
// create-environment form is the one that fails). No real user types that fast, so we restore
// the pre-16 delay here for the whole suite instead of racing the framework.
Cypress.Keyboard.defaults({ keystrokeDelay: 10 });

// Wrap in before() to ensure it runs before any test
beforeEach(() => {
  cy.on("uncaught:exception", (err) => {
    // Only ignore the specific Monaco editor disposal error
    console.log(err.message);

    if (err.message.includes("TextModel")) {
      return false; // Prevents the error from failing tests
    }

    // Allow other uncaught exceptions to fail tests
    return true;
  });

  localStorage.setItem("theme-preference", "light");
});
