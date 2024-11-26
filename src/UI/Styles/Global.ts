import { createGlobalStyle } from "styled-components";
import { MarkdownStyles } from "./MarkdownStyles";

export const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

  /** 
   * The standard file upload from patternfly 6 is adding a default inline padding that is different than the ones from other input fields. 
   * This override aligns it with the other fields. 
   **/
  .pf-v6-c-file-upload {
    padding-inline-start: var(--pf-v6-c-form-control--PaddingInlineStart);
    padding-inline-end: var(--pf-v6-c-form-control--PaddingInlineEnd);
  }

  .pf-v6-c-select {
    min-width: 180px;
  }

  ${MarkdownStyles}
`;
