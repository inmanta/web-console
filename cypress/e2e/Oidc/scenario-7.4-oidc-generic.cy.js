if (Cypress.env("oidc")) {
  it("should be able to login and logout", () => {
    cy.visit("/console/");

    cy.origin("http://127.0.0.1:8080", () => {
      cy.get("input[name=username]").type("admin");
      cy.get("input[type=submit]").click();
    });

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should(
      "contain",
      "admin",
    );
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("Logout").click();

    cy.origin("http://127.0.0.1:8080", () => {
      cy.get("input[name=username]").should("be.visible");
    });
  });
}
