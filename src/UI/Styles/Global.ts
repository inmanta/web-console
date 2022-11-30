import { createGlobalStyle } from "styled-components";

/**
 * @NOTE on .pf-c-page__header-nav
 * Patternyfly React does not support page header context selector yet. We place the context selector in the nav section,
 * but this requires us to overload the page header nav styling to match the header context selector in the html version
 * References:
 * - https://github.com/patternfly/patternfly-react/blob/2f1671c51d6aca64add31d0c3513c8e781d2bfbd/packages/patternfly-4/react-core/src/components/Page/PageHeader.tsx#L84
 * - https://github.com/patternfly/patternfly-next/blame/master/src/patternfly/components/Page/docs/code.md#L25
 *
 * @NOTE on .pf-c-page
 * https://www.patternfly.org/v4/components/page#pagebreadcrumb
 * https://www.patternfly.org/v4/components/breadcrumb
 */
export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

  .pf-c-page__header-nav {
    align-self: auto;
    background-color: transparent;
  }

  .pf-c-page {
    --pf-c-page__main-breadcrumb--PaddingBottom: var(--pf-global--spacer--md);
  }
  .pf-c-page__sidebar-body {
    height: 100%;
  }
  .pf-c-chip__text {
    max-width: fit-content;
  }
  .pf-c-form__field-group-body {
    min-height: 0;
  }

  .pf-c-calendar-month__header-year {
    width: 9ch;
  }
  .pf-c-toolbar__content-section {
    gap: var(--pf-global--spacer--sm);
    align-items: flex-start;
  }
  .pf-c-select {
    min-width: 180px;
  }
  .pf-c-toolbar__item .pf-c-input-group {
    height: auto !important;
  }
  @media (max-width: 1000px) {
    *[aria-label="FilterBar"] {
      gap: var(--pf-global--spacer--md);
      flex-wrap: wrap;
    }
  }

`;
