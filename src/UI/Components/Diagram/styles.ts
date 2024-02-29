import styled from "styled-components";
import editBttn from "./icons/edit-button.svg";
import linkBttn from "./icons/link-button.svg";
import removeBttn from "./icons/remove-button.svg";

export const CanvasWrapper = styled.div`
  width: 100%;
  height: calc(100% - 86px);
  position: relative;
  background: var(-pf-v5-global--palette--black-200);
  margin: 0;
  overflow: hidden;
  .canvas {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    background: var(--pf-v5-global--BackgroundColor--light-300);

    .joint-element {
      filter: drop-shadow(
        0.1rem 0.1rem 0.15rem
          var(--pf-v5-global--BackgroundColor--dark-transparent-200)
      );
    }
    .joint-paper-background {
      background: var(--pf-v5-global--BackgroundColor--light-300);
    }

    .source-arrowhead,
    .target-arrowhead {
      fill: var(-pf-v5-global--palette--black-500);
      stroke-width: 1;
    }
  }

  //  ***  ui.Halo ***
  .joint-halo .box {
    display: none;
  }
  .joint-halo.toolbar .handles {
    padding: 0;
  }

  .joint-halo.joint-theme-default.toolbar .handles {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: row-reverse;
    border: 0;
    border-radius: 0;
    background-color: transparent;
    margin-top: -25px;
    top: 0;

    &:after {
      display: none;
    }
  }

  .joint-halo.joint-theme-default.toolbar.type-element .handle {
    cursor: pointer;
    &.delete {
      position: static;
      background-image: url(${removeBttn});
      margin: 0;
    }
    &.link {
      background-image: url(${linkBttn});
      margin: 0 4px;
    }
    &.edit {
      background-image: url(${editBttn});
      margin: 0;
    }
  }

  .joint-halo {
    position: relative;
    &:after {
      position: relative;
      border: 1px dashed var(--pf-v5-global--palette--black-900);
      content: "";
      display: inline-block;
      width: calc(100% + 10px);
      height: calc(100% + 20px);
      left: -5px;
      top: -5px;
    }
  }

  .joint-link_remove-circle {
    fill: var(--pf-v5-global--BackgroundColor--light-300);
    stroke: var(--pf-v5-global--palette--red-100);
  }
  .joint-link_remove-path {
    fill: none;
    stroke: var(--pf-v5-global--palette--red-100);
  }
  .joint-halo-highlight {
    stroke: var(--pf-v5-global--palette--light-green-300);
    fill: var(--pf-v5-global--palette--light-green-300);
  }
  .joint-loose_element-highlight {
    stroke: var(--pf-v5-global--palette--red-100);
    fill: var(--pf-v5-global--palette--red-100);
    &.-hidden {
      display: none;
    }
  }
  .joint-entityBlock-body {
    stroke: var(--pf-v5-global--BackgroundColor--100);
  }
  .joint-entityBlock-header {
    fill: var(--pf-v5-global--active-color--100);
    stroke: var(--pf-v5-global--active-color--100);

    &.-embedded {
      fill: var(--pf-v5-global--palette--cyan-300);
      stroke: var(--pf-v5-global--palette--cyan-300);
    }
    &.-core {
      fill: var(--pf-v5-global--warning-color--100);
      stroke: var(--pf-v5-global--warning-color--100);
    }
  }
  .joint-entityBlock-header-label {
    fill: var(--pf-v5-global--Color--light-100);
  }
  .joint-entityBlock-itemLabels {
    fill: var(--pf-v5-global--Color--100);
  }
  .joint-entityBlock-itemLabels-one {
    fill: var(--pf-v5-global--palette--black-400);
  }
  .joint-entityBlock-spacer {
    fill: var(--pf-v5-global--Color--100);
    stroke: var(--pf-v5-global--Color--100);
  }
  .joint-link-marker {
    stroke: var(--pf-v5-global--palette--black-400);
    fill: var(--pf-v5-global--palette--black-400);
  }
  .joint-link-line {
    stroke: var(--pf-v5-global--palette--black-400);
  }
`;
