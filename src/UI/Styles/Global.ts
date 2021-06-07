import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

  /* https://www.patternfly.org/v4/components/page#pagebreadcrumb */
  /* https://www.patternfly.org/v4/components/breadcrumb */
  .pf-c-page {
    --pf-c-page__main-breadcrumb--PaddingBottom: var(--pf-global--spacer--md);
  }
`;
