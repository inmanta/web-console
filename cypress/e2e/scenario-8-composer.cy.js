/**
 * This scenario tests the Service Composer functionality. 
 * It requires the PXSDC Project to be installed.
 */

if (Cypress.env("edition") === "iso") {
  describe("Scenario 8 Composer", () => {
    it("should test the Service Composer functionality", () => {
      cy.visit("/console/");
    });
  });
}