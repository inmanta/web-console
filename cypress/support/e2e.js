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
});
