import { mount } from "cypress/react18";
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      getAriaLabel: (
        label: string,
      ) => Chainable<JQuery<HTMLElementTagNameMap[K]>>;
      getJointSelector: (
        label: string,
      ) => Chainable<JQuery<HTMLElementTagNameMap[K]>>;
      getInstanceShape: (
        shapeTitle: string,
      ) => Chainable<JQuery<HTMLElementTagNameMap[K]>>;
    }
  }
}
