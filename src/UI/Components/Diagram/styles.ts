import styled from "styled-components";
import editBttn from "./icons/edit-button.svg";
import linkBttn from "./icons/link-button.svg";
import removeBttn from "./icons/remove-button.svg";

export const CanvasWrapper = styled.div`
  display: flex;
  width: 100%;
  height: calc(80vh - 170px);
  border-radius: var(--pf-t--global--border--radius--small);
  color: var(--pf-t--global--text--color--regular);
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--pf-t--global--border--color--default);

  .joint-toolbar.joint-theme-default {
    background-color: var(--pf-t--global--background--color--primary--default);
  }
  .joint-paper-scroller.joint-theme-default {
    background-color: var(
      --pf-t--global--background--color--secondary--default
    );
  }

  button.joint-widget.joint-theme-default {
    background-color: var(--pf-v6-c-button--BackgroundColor);
  }

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .joint-stencil {
    top: 52px;
    border: 0;
    background-color: var(--pf-t--global--background--color--primary--default);

    .group > .group-label {
      text-transform: none;
      color: var(--pf-t--global--text--color--regular);
      font-size: var(--pf-t_global_font_size_body_lg);

      &::before {
        border-top-color: var(--pf-t--global--text--color--regular);
      }
    }

    &.joint-hidden {
      visibility: hidden; //note: display: none breaks the stencil-groups
    }

    .content {
      padding: 12px 0;
    }

    .stencil_body-disabled {
      pointer-events: none;
      fill: var(--pf-t--global--background--color--disabled--default);
    }

    .stencil_text-disabled {
      pointer-events: none;
      fill: var(--pf-t--global--text--color--disabled);
    }

    .stencil_accent-disabled {
      pointer-events: none;
      fill: var(--pf-t--global--text--color--disabled);
    }
  }

  .joint-element {
    filter: drop-shadow(
      0.1rem 0.1rem 0.15rem var(--pf-t--global--box-shadow--color--100)
    );
  }

  .joint-stencil.searchable > .content {
    top: 60px;
  }

  .joint-stencil.joint-theme-default .search {
    padding: var(--pf-t--global--spacer--control--vertical--spacious)
      var(--pf-t--global--spacer--control--horizontal--default);
    border: 1px solid var(--pf-t--global--border--color--default);
    border-bottom: 1px solid var(--pf-t--global--border--color--default);
    border-radius: var(--pf-t--global--border--radius--small);
    background: var(--pf-t--global--background--color--secondary--default);
    color: var(--pf-t--global--text--color--regular);
  }

  .joint-stencil.not-found.searchable:after {
    top: 60px;
    background: var(--pf-t--global--background--color--primary--default);
    color: var(--pf-t--global--text--color--regular);
  }

  .joint-stencil.joint-theme-default .search-wrap {
    padding: var(--pf-t--global--spacer--control--vertical--spacious);
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
    padding-bottom: 20px;
    top: 20px;
    gap: 4px;

    &:after {
      display: none;
    }
  }

  .joint-halo.joint-theme-default.toolbar.type-element .handle {
    cursor: pointer;
    min-width: 25px;
    min-height: 25px;
    background-size: 25px 25px;
    &.delete {
      background-image: url(${removeBttn});
    }
    &.link {
      background-image: url(${linkBttn});
    }
    &.edit {
      background-image: url(${editBttn});
    }
    &:hover {
      box-shadow: 4px 4px 8px var(--pf-t--global--box-shadow--color--100);
      border-radius: 3px;
    }
  }

  .joint-halo {
    position: relative;
    &:after {
      position: relative;
      border: 1px dashed var(--pf-t--global--border--color--brand--default);
      border-radius: var(--pf-t--global--border--radius--medium);
      content: "";
      display: inline-block;
      width: calc(100% + 18px);
      height: calc(100% + 20px);
      left: -9px;
      top: -5px;
    }
  }

  .joint-link_remove-circle {
    fill: var(--pf-t--global--background--color--secondary--default);
    stroke: var(--pf-t--global--icon--color--status--danger--default);
  }
  .joint-link_remove-path {
    fill: none;
    stroke: var(--pf-t--global--border--color--status--danger--default);
  }
  .joint-halo-highlight {
    stroke: var(--pf-t--global--border--color--status--success--default);
    fill: var(--pf-t--global--color--status--success--default);
  }
  .joint-loose_element-highlight {
    stroke: var(--pf-t--global--border--color--status--danger--default);
    fill: var(--pf-t--global--color--status--danger--default);
    &.-hidden {
      display: none;
    }
  }
  .joint-entityBlock-body {
    stroke: var(--pf-t--global--background--color--primary--default);
  }
  .joint-entityBlock-itemLabels {
    fill: var(--pf-t--global--text--color--regular);
  }
  .joint-entityBlock-itemLabels-one {
    fill: var(--pf-t--global--text--color--regular);
  }
  .joint-entityBlock-spacer {
    fill: var(--pf-t--global--border--color--on-secondary);
    stroke: var(--pf-t--global--border--color--on-secondary);
  }
  .joint-link-marker {
    stroke: var(--pf-t--global--border--color--on-secondary);
    fill: var(--pf-t--global--border--color--on-secondary);
  }
  .joint-link-line {
    stroke: var(--pf-t--global--border--color--on-secondary);
  }

  .joint-paper svg {
    overflow: visible;
  }
  .joint-label-text {
    font-family: var(--pf-t--global--font--family--mono);
    fill: var(--pf-t--global--text--color--regular);
    transform: none;
  }
`;
