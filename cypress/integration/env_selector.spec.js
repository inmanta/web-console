/// <reference types="Cypress" />
describe('Environment selector', function () {
  it('Has multiple entries based on backend response', function () {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/v2/project',
      response: 'fixture:environments.json'
    })
    cy.visit('/');
    cy.get('.pf-c-context-selector__toggle').click();

    cy.get('.pf-c-context-selector__menu-list-item').should((items) => {

      let texts = items.map((idx, item) => (
        Cypress.$(item).text()
      ));

      texts = texts.get();
      expect(texts).to.have.length(2);
      expect(texts).to.deep.eq([
        'End-to-end Service Orchestration Demo / demo',
        'End-to-end Service Orchestration Demo / live'
      ]);
    });
  })
})