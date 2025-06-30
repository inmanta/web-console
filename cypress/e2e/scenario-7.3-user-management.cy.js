if (Cypress.env("local-auth")) {
  it("should be able to add user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[data-testid="user-row"]').should("have.length", 6);

    cy.get('[aria-label="add_user-button"]').click();

    cy.get("h1").contains("Add User").should("be.visible");
    cy.get('[aria-label="input-username"]').type("new_user");
    cy.get('[aria-label="input-password"]').type("short");

    cy.get('[aria-label="confirm-button"]').click();

    cy.get("span")
      .contains("Invalid request: the password should be at least 8 characters long")
      .should("be.visible");

    cy.get('[aria-label="input-password"]').clear().type("password");

    cy.get('[aria-label="confirm-button"]').click();

    cy.get('[data-testid="user-row"]').should("have.length", 7);
  });

  it("should be able to remove user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[data-testid="user-row"]').should("have.length", 7);

    cy.get('[data-testid="user-row"]').eq(1).find("button").contains("Delete").click();

    cy.get("button").contains("Yes").click();

    cy.get('[data-testid="user-row"]', { timeout: 20000 }).should("have.length", 6);
  });

  it("should be able to change user password", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[data-testid="user-row"]').should("have.length", 6);

    cy.get('[data-testid="user-row"]').eq(0).find("button").contains("Change Password").click();

    cy.get("h1").contains("Change Password").should("be.visible");

    cy.get('[aria-label="new-password-input"]').type("123");

    cy.get('[data-testid="change-password-button"]').click();

    cy.get("span")
      .contains("Invalid request: the password should be at least 8 characters long")
      .should("be.visible");

    cy.get('[aria-label="new-password-input"]').clear().type("12345678");

    cy.get('[data-testid="change-password-button"]').click();

    cy.get('[data-testid="ToastAlert"]').should("to.be.visible");
    cy.get('[aria-label="Close Success alert: alert: Success"]').click();

    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("Logout").click();

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("12345678{enter}");

    cy.get("h1").contains("Home").should("be.visible");
  });

  it("should be able to add role to user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("12345678{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[data-testid="user-row"]').should("have.length", 6);

    cy.get('[aria-label="row-admin"]').within(() => {
      cy.get("button").contains("No roles assigned").should("be.visible");

      cy.get('[aria-label="Toggle-user-row"]').click();
    });

    cy.get("button").contains("Select roles...").click();

    cy.get('[aria-label="environment-admin"]').click();

    cy.get("span").contains("environment-admin").should("be.visible");

    cy.get('[aria-label="row-admin"]').within(() => {
      cy.get("button").contains("No roles assigned").should("not.exist");

      cy.get("button").contains("environment-admin").should("be.visible");
    });

    cy.get('[aria-label="Expanded-Details"]').within(() => {
      cy.get("span").contains("No roles assigned").should("not.exist");

      cy.get("span").contains("environment-admin").should("be.visible");
    });

    cy.get('[aria-label="noc"]').click();

    cy.get('[aria-label="row-admin"]').within(() => {
      cy.get("button").contains("environment-admin, noc").should("be.visible");
    });

    cy.get('[aria-label="Expanded-Details"]').within(() => {
      cy.get("span").contains("environment-admin").should("be.visible");
      cy.get("span").contains("noc").should("be.visible");
    });
  });

  it("should be able to remove role to user", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("12345678{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    cy.get("h1").contains("User Management").should("be.visible");

    cy.get('[data-testid="user-row"]').should("have.length", 6);

    cy.get("button").contains("environment-admin, noc").click();

    cy.get('[aria-label="Expanded-Details"]').within(() => {
      cy.get("span").contains("environment-admin").should("be.visible");
      cy.get("span").contains("noc").should("be.visible");

      cy.get('[aria-label="container-chip-noc"]').within(() => {
        cy.get("button").click();
      });

      cy.get('[aria-label="container-chip-environment-admin"]').should("be.visible");
      cy.get('[aria-label="container-chip-noc"]').should("not.exist");
    });

    cy.get('[aria-label="row-admin"]').within(() => {
      cy.get("button").contains("environment-admin").should("be.visible");
    });

    cy.get("button").contains("Select roles...").click();

    cy.get('[aria-label="environment-admin"]').click();

    cy.get('[aria-label="Expanded-Details"]').within(() => {
      cy.get('[aria-label="container-chip-environment-admin"]').should("not.exist");
      cy.get('[aria-label="container-chip-noc"]').should("not.exist");

      cy.get("span").contains("No roles assigned").should("be.visible");
    });

    cy.get('[aria-label="row-admin"]').within(() => {
      cy.get("button").contains("environment-admin").should("not.exist");
      cy.get("button").contains("No roles assigned").should("be.visible");
    });
  });
}
