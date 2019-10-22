/// <reference types="Cypress" />
describe('Service catalog', function () {
  beforeEach( () => {
    cy.server();
    cy.route({
      method: 'GET',
      url: '**/api/v2/project',
      response: 'fixture:environments.json'
    });
    cy.route({
      method: 'GET',
      url: '**/lsm/v1/service_catalog',
      response: 'fixture:lsm/service_catalog.json'
    });
    cy.visit('/lsm/catalog');
  });
  it('Has multiple entries based on backend response', function () {
    cy.get('.pf-c-data-list__item').should('have.length', 2);
    cy.get('#e2e_service-toggle').click();
    cy.get('#e2e_service-expand').find('.pf-c-tabs__item').find('.pf-c-tabs__button').should('have.length', 2);
    cy.get('#e2e_service-expand').find('.pf-c-tabs__item').find('.pf-c-tabs__button').then((tabs) => {
      let texts = tabs.map((idx, tab) => (
        Cypress.$(tab).text()
      ));

      texts = texts.get();
      expect(texts).to.deep.eq([
        'Attributes',
        'Lifecycle States'
      ]);
    });
  });
  it('Should navigate between tabs', function () {
    cy.get('#e2e_service-toggle').click();
    cy.get('#e2e_service-expand').find('.pf-c-tab-content').first().should('be.visible');
    cy.get('#e2e_service-expand').find('.pf-c-tab-content').last().should('not.be.visible');
    cy.contains('Lifecycle States').click();
    cy.get('#e2e_service-expand').find('.pf-c-tab-content').first().should('not.be.visible');
    cy.get('#e2e_service-expand').find('.pf-c-tab-content').last().should('be.visible');
  });
  it('Should open multiple items in data list', function () {
    cy.get('#e2e_service-toggle').click();
    cy.get('#another_e2e_service-toggle').click();
    
    cy.get('#e2e_service-expand').find('.pf-c-tab-content').first().should('be.visible');
    cy.get('#another_e2e_service-expand').scrollIntoView();
    cy.get('#another_e2e_service-expand').find('.pf-c-tab-content').first().should('be.visible');    
  });
})