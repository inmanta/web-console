/**
 * Cypress custom commands for verifying that Monaco Editor never loads
 * resources from an external CDN at runtime.
 *
 * Usage — add these two calls around any test that renders Monaco or LogViewer:
 *
 *   cy.startMonacoCDNCheck();   // before cy.visit
 *   // ... interact with the page until Monaco is visible ...
 *   cy.assertNoCDNDownloads();  // after Monaco has rendered
 *
 * Origins checked:
 *   cdn.jsdelivr.net — default @monaco-editor/loader fallback
 *   esm.sh           — @graphiql/react CDN worker setup
 */

let _monacoFromCDN = [];

/**
 * Register intercepts for known Monaco CDN origins and reset the hit counter.
 * Must be called BEFORE cy.visit so every request from the first byte is captured.
 */
Cypress.Commands.add("startMonacoCDNCheck", () => {
  _monacoFromCDN = [];

  cy.intercept({ url: /cdn\.jsdelivr\.net/ }, (req) => {
    _monacoFromCDN.push(req.url);
    req.continue();
  });

  cy.intercept({ url: /esm\.sh/ }, (req) => {
    _monacoFromCDN.push(req.url);
    req.continue();
  });
});

/**
 * Assert that no CDN requests were made since startMonacoCDNCheck() was called.
 * Call this after Monaco has fully rendered (e.g. after asserting .monaco-editor exists).
 */
Cypress.Commands.add("assertNoCDNDownloads", () => {
  cy.then(() => {
    const label =
      _monacoFromCDN.length > 0
        ? `Monaco CDN requests (${_monacoFromCDN.length}):\n  ${_monacoFromCDN.join("\n  ")}`
        : "Monaco CDN requests";
    expect(_monacoFromCDN, label).to.have.length(0);
  });
});

/**
 * Types text into the focused Monaco editor.
 *
 * Since 0.56, Monaco takes text input through the browser's EditContext API, which ignores the
 * synthetic key events `cy.type()` sends: shortcuts and keys like {backspace} still work, but
 * characters never reach the editor. This inserts the text through the Chrome DevTools Protocol
 * instead, the way real keyboard input arrives. Focus the editor (or the spot to type at) first.
 *
 * @param {string} text - The text to insert at the cursor.
 */
Cypress.Commands.add("typeInMonaco", (text) => {
  cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "Input.insertText",
      params: { text },
    }),
    { log: false }
  );
});
