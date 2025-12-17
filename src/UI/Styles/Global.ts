import { createGlobalStyle } from "styled-components";
import { MarkdownStyles } from "./MarkdownStyles";
import "highlight.js/styles/github.css";

export const GlobalStyles = createGlobalStyle`
  html {
    --pf-v5-chart-donut--label--title--Fill: var(--pf-t--global--text--color--subtle);
    --pf-v5-chart-global--label--Fill: var(--pf-t--global--text--color--regular);
  }

  /** 
   * The standard file upload from patternfly 6 is adding a default inline padding that is different than the ones from other input fields. 
   * This override aligns it with the other fields. 
   **/
  .pf-v6-c-file-upload {
    padding-inline-start: var(--pf-v6-c-form-control--PaddingInlineStart);
    padding-inline-end: var(--pf-v6-c-form-control--PaddingInlineEnd);
  }

  /**
   * PF-6 has by default the inherit value for the vertical-align property on the tr element and tbody element. 
   * Which results in the content of the tr element to be aligned to the top of the row as it inherits the userAgent stylesheet value "top".
   **/
  tbody tr {
    vertical-align: middle;
  }

  /**
   * Add the .danger class to the table row to apply the danger color to the row.
   **/
  .pf-v6-c-table tr:where(.danger) {
    background-color: var(--pf-t--global--color--nonstatus--red--default);
    &.pf-m-clickable {
      background-color: var(--pf-t--global--color--nonstatus--red--default);
    }
    &.pf-m-selected {
      background-color: var(--pf-t--global--color--nonstatus--red--clicked);
    }
    &:hover {
      background-color: var(--pf-t--global--color--nonstatus--red--hover);
    }
  }

  /**
   * Add the .warning class to the table row to apply the danger color to the row.
   **/
  .pf-v6-c-table tr:where(.warning) {
    background-color: var(--pf-t--global--color--nonstatus--yellow--default);
    &.pf-m-clickable {
      background-color: var(--pf-t--global--color--nonstatus--yellow--default);
    }
    &.pf-m-selected {
      background-color: var(--pf-t--global--color--nonstatus--yellow--clicked);
    }
    &:not(.pf-m-expanded):hover {
      background-color: var(--pf-t--global--color--nonstatus--yellow--hover);
    }
  }

  /**
   * Enforce the toggle columns to have the maximal width everywhere.
   **/
  .toggle-cell,
  .pf-v6-c-table .pf-v6-c-table__toggle {
    --pf-v6-c-table--cell--MaxWidth: 40px;
    --pf-v6-c-table--cell--MinWidth: 40px;
    --pf-v6-c-table--cell--first-last-child--PaddingInline: 0;
  } 

  .pf-v6-c-select {
    min-width: 180px;
  }

  .pf-v6-c-code-editor__main,
  .pf-v6-c-code-editor__main .monaco-editor,
  .monaco-editor .margin {
    --vscode-editor-background: var(--pf-t--global--background--color--primary--default) !important;
    background-color: var(--pf-t--global--background--color--primary--default) !important;
  }

  /** 
   * We are overriding the blue label color to be darker than the default blue used for labels. 
   * The default blue is not contrasting enough with the teal label color that is used for the skipped status.
   * in PF 5 we'd use the info status label for "deploying", but moving to PF 6, they changed their info color to purple.
   * And that was a change we didn't want for our UI.
  */
  .pf-v6-c-label.pf-m-outline.pf-m-blue {
     --pf-v6-c-label--BorderColor: var(--pf-t--color--blue--50);
  }

  ${MarkdownStyles}
`;
