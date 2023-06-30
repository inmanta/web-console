if (Cypress.env("keycloak")) {
  it("should be able to login and logout", () => {
    cy.visit("/console/");

    cy.origin("http://localhost:8080", () => {
      cy.get("[id=username]").type("admin");
      cy.get("[id=password]").type("admin{enter}");
    });

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]").should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get("a").contains("Logout").click();

    cy.origin("http://localhost:8080", () => {
      cy.get("[id=username]").should("be.visible");
      cy.get("[id=password]").should("be.visible");
    });
  });
}
