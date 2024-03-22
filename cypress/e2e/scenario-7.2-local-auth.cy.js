if (Cypress.env("local-auth")) {
  it("should be able to login and logout", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get(".pf-v5-c-menu__item").contains("Logout").click();

    cy.get('[id="pf-login-username-id"]').should("be.visible");
    cy.get('[id="pf-login-password-id"]').should("be.visible");
  });
}
