if (Cypress.env("local-auth")) {
  it("should be able to add user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get(".pf-v5-c-menu__item").contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[role="user-row"]').should("have.length", 1);

    cy.get("button").contains("Add User").click();

    cy.get("h1").contains("Add User").should("be.visible");
    cy.get('[aria-label="input-username"]').type("new_user");
    cy.get('[aria-label="input-password"]').type("short");

    cy.get("button").contains("Add").click();

    cy.get("span")
      .contains(
        "Invalid request: the password should be at least 8 characters long",
      )
      .should("be.visible");

    cy.get('[aria-label="input-password"]').clear().type("password");

    cy.get("button").contains("Add").click();

    cy.get('[role="user-row"]').should("have.length", 2);
  });

  it("should be able to remove user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get(".pf-v5-c-menu__item").contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[role="user-row"]').should("have.length", 2);

    cy.get('[role="user-row"]').eq(1).find("button").contains("Delete").click();

    cy.get("button").contains("Yes").click();

    cy.get('[role="user-row"]', { timeout: 20000 }).should("have.length", 1);
  });
}
