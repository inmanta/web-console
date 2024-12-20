import { createGlobalStyle } from "styled-components";
import { MarkdownStyles } from "./MarkdownStyles";

export const GlobalStyles = createGlobalStyle`
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
  .pf-v6-c-table .pf-v6-c-table__toggle {
    --pf-v6-c-table--cell--MaxWidth: 10px;
  } 

  .pf-v6-c-select {
    min-width: 180px;
  }

  ${MarkdownStyles}
`;
