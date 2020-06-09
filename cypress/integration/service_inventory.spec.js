/// <reference types="Cypress" />
describe('Service inventory', function () {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '**/api/v2/project',
      response: 'fixture:environments.json'
    });
    cy.route({
      method: 'GET',
      url: '**/lsm/v1/service_inventory/e2e_service',
      response: 'fixture:lsm/service_inventory.json'
    });
    cy.route({
      method: 'GET',
      url: '**/lsm/v1/service_inventory/e2e_service/*/resources?current_version=*',
      response: 'fixture:lsm/resources.json'
    });
    cy.route({
      method: 'GET',
      url: '**/lsm/v1/service_catalog/e2e_service',
      response: 'fixture:lsm/service_catalog_single.json'
    });

  });

  it('Should show/hide resources modal on click', function () {
    cy.visit('/lsm/catalog/e2e_service/inventory');
    cy.get('#nav-toggle').click();
    cy.get('.pf-c-table').find('.pf-c-button.pf-m-primary').click();
    cy.get('td[data-label="State"]').should('include.text', 'deployed');
    cy.contains('Close').click().should('not.exist');
    cy.get('.pf-c-modal-box').should('not.exist');
  });
  it('Should show add/hide instance modal on click', function () {
    cy.visit('/lsm/catalog/e2e_service/inventory');
    cy.contains("button", "Add instance").click();
    // cy.get('#add-instance-button').click();
    cy.contains('Cancel').click().should('not.exist');
  });
  it('Should filter read-only attributes on create instance modal', function () {
    cy.visit('/lsm/catalog/e2e_service/inventory');
    cy.contains("button", "Add instance").click();
    // cy.get('#add-instance-button').click();
    cy.get('#readonly').should('not.exist');
  });
});