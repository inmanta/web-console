if (Cypress.env("keycloak")) {
  it("should be able to login and logout", () => {
    cy.visit("/console/");

    cy.origin("http://127.0.0.1:8080", () => {
      cy.get("[id=username]").type("admin");
      cy.get("[id=password]").type("admin{enter}");

      cy.get("[id=email]").type("admin@admin.com");
      cy.get("[id=firstName]").type("Admin");
      cy.get("[id=lastName]").type("Administrator{enter}");
    });

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("Logout").click();

    cy.origin("http://127.0.0.1:8080", () => {
      cy.get("[id=username]").should("be.visible");
      cy.get("[id=password]").should("be.visible");
    });
  });
}
