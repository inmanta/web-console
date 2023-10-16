import { createGlobalStyle } from "styled-components";

/**
 * @NOTE on .pf-v5-c-page__header-nav
 * Patternyfly React does not support page header context selector yet. We place the context selector in the nav section,
 * but this requires us to overload the page header nav styling to match the header context selector in the html version
 * References:
 * - https://github.com/patternfly/patternfly-react/blob/2f1671c51d6aca64add31d0c3513c8e781d2bfbd/packages/patternfly-4/react-core/src/components/Page/PageHeader.tsx#L84
 * - https://github.com/patternfly/patternfly-next/blame/master/src/patternfly/components/Page/docs/code.md#L25
 *
 * @NOTE on .pf-v5-c-page
 * https://www.patternfly.org/v4/components/page#pagebreadcrumb
 * https://www.patternfly.org/v4/components/breadcrumb
 */
export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
    
  }

  .pf-v5-c-icon__content.pf-m-custom {
    --pf-v5-c-icon__content--m-custom--Color: #D2D2D2;
  }

  .pf-v5-c-page__header-nav {
    align-self: auto;
    background-color: transparent;
  }

  .pf-v5-c-page {
    --pf-v5-c-page__main-breadcrumb--PaddingBottom: var(--pf-v5-global--spacer--md);
  }
  .pf-v5-c-page__sidebar-body {
    height: 100%;
    max-height: calc(100vh - var(--pf-v5-c-page__header--MinHeight) - 60px);
  }
  .pf-v5-c-chip__text {
    max-width: fit-content;
  }
  .pf-v5-c-form__field-group-body {
    min-height: 0;
  }

  .pf-v5-c-calendar-month__header-year {
    width: 9ch;
  }
  .pf-v5-c-toolbar__content-section {
    gap: var(--pf-v5-global--spacer--sm);
  }
  .pf-v5-c-select {
    min-width: 180px;
  }
  @media (max-width: 1000px) {
    *[aria-label="FilterBar"] {
      gap: var(--pf-v5-global--spacer--md);
      flex-wrap: wrap;
    }
  }

`;
