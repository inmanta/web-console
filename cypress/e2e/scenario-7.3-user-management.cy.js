if (Cypress.env("local-auth")) {
  it.only("should display the roles for a user, and allow them to be added and removed", () => {
    cy.visit("/console/");

    cy.get('[id="pf-login-username-id"]').type("admin");
    cy.get('[id="pf-login-password-id"]').type("adminadmin{enter}");

    cy.get("h1").contains("Home").should("be.visible");

    cy.get("[id=toggle-button]", { timeout: 20000 }).should("contain", "admin");
    cy.get("[id=toggle-button]").click();

    cy.get('[role="menuitem"]').contains("User Management").click();

    // For Admin Assert "None" in Roles column and expand
    cy.get('tr[aria-label="row-admin"]').within(() => {
      // Check that the first cell contains an SVG icon before the username
      cy.get("td")
        .first()
        .within(() => {
          cy.get("svg").should("exist");
          cy.contains("admin");
        });
      // Assert the Roles column contains a button with text "None"
      cy.get('td[data-label="Roles"] button').should("contain", "None");
      // Click the "None" button
      cy.get('td[data-label="Roles"] button').click();
    });

    cy.get('tr[aria-label="expanded-row-admin"]')
      .should("be.visible")
      .within(() => {
        // Assert the nested table exists
        cy.get('table[aria-label="Nested-Roles-Table"]')
          .should("exist")
          .within(() => {
            // Assert there is exactly one environment row (tbody > tr)
            cy.get("tbody tr").should("have.length", 1);
            // Assert the first cell contains "env"
            cy.get("tbody tr").first().find("td").first().should("contain", "env");
            // Assert the select button exists and is clickable
            cy.get('button[aria-label="role-selector"]')
              .should("exist")
              .and("contain", "Edit roles")
              .click();
          });
      });

    cy.get("div#role-selector")
      .should("be.visible")
      .within(() => {
        cy.get('ul[role="listbox"]').within(() => {
          cy.contains("li", "environment-admin").should("exist");
          cy.contains("li", "environment-expert-admin").should("exist");
          cy.contains("li", "noc").should("exist");
          cy.contains("li", "operator").should("exist");
          cy.contains("li", "read-only").should("exist");
          // Click the first three roles
          cy.contains("li", "environment-admin")
            .find('input[type="checkbox"]')
            .click({ force: true });
          cy.contains("li", "environment-expert-admin")
            .find('input[type="checkbox"]')
            .click({ force: true });
          cy.contains("li", "noc").find('input[type="checkbox"]').click({ force: true });
        });
      });

    // Click outside to close the dropdown
    cy.get("body").click(0, 0);

    // Assert the labels are present in the row
    cy.get(
      'tr[aria-label="expanded-row-admin"] table[aria-label="Nested-Roles-Table"] tbody tr'
    ).within(() => {
      cy.get('[data-testid="role-label-environment-admin"]')
        .should("exist")
        .and("contain", "environment-admin");
      cy.get('[data-testid="role-label-environment-expert-admin"]')
        .should("exist")
        .and("contain", "environment-expert-admin");
      cy.get('[data-testid="role-label-noc"]').should("exist").and("contain", "noc");
    });

    // Open the dropdown again to remove a role
    cy.get(
      'tr[aria-label="expanded-row-admin"] table[aria-label="Nested-Roles-Table"] tbody tr'
    ).within(() => {
      cy.get('button[aria-label="role-selector"]').click();
    });
    cy.get("div#role-selector")
      .should("be.visible")
      .within(() => {
        cy.get('ul[role="listbox"]').within(() => {
          cy.contains("li", "environment-expert-admin")
            .find('input[type="checkbox"]')
            .click({ force: true });
        });
      });
    // Assert the label for 'environment-expert-admin' is removed, others remain
    cy.get(
      'tr[aria-label="expanded-row-admin"] table[aria-label="Nested-Roles-Table"] tbody tr'
    ).within(() => {
      cy.get('[data-testid="role-label-environment-admin"]')
        .should("exist")
        .and("contain", "environment-admin");
      cy.get('[data-testid="role-label-noc"]').should("exist").and("contain", "noc");
      cy.get('[data-testid="role-label-environment-expert-admin"]').should("not.exist");
    });

    // Assert the Roles column for admin now displays '2 roles' instead of 'None'
    cy.get('tr[aria-label="row-admin"]').within(() => {
      cy.get('td[data-label="Roles"] button').should("contain", "environment-admin, noc");
      cy.get('td[data-label="Roles"] button').should("not.contain", "None");
    });
  });

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
}
