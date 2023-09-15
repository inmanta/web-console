// React 18
import { mount } from "cypress/react18";

Cypress.Commands.add("mount", (component: React.ReactNode, options) => {
  // Wrap any parent components needed
  // ie: return mount(<MyProvider>{component}</MyProvider>, options)
  return mount(component, options);
});

Cypress.Commands.add("getAriaLabel", (label) => {
  return cy.get(`[aria-label="${label}"]`);
});

Cypress.Commands.add("getJointSelector", (label) => {
  return cy.get(`[joint-selector="${label}"]`);
});

Cypress.Commands.add("getInstanceShape", (shapeTitle) => {
  return cy
    .get('[data-type="app.ServiceEntityBlock"]')
    .contains(shapeTitle)
    .parent()
    .parent();
});
