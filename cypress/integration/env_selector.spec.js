/// <reference types="Cypress" />
describe('Environment selector', function () {
  it('Has multiple entries based on backend response', function () {
    cy.server();
    cy.route({
      method: 'GET',
      url: '**/api/v2/project',
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
  });
  it('Has correct entry selected when env parameter is set', function () {
    cy.server();
    cy.route({
      method: 'GET',
      url: '**/api/v2/project',
      response: 'fixture:environments.json'
    })
    cy.visit('/lsm/catalog?env=36cdbc7e-28a1-4803-e8c1-6743f52a594c');
    cy.get('.pf-c-context-selector__toggle-text').should("contain.text", "live");
  })
})