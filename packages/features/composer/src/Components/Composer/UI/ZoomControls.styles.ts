import styled from "styled-components";
import { LEFT_SIDEBAR_WIDTH, RIGHT_SIDEBAR_OFFSET } from "../config";

export const ZoomControlsContainer = styled.div`
  position: absolute;
  bottom: 25px;
  // Centre the toolbar in the canvas, clear of the left sidebar and the right details
  // sidebar so it never overlaps the details form.
  left: ${LEFT_SIDEBAR_WIDTH}px;
  right: ${RIGHT_SIDEBAR_OFFSET}px;
  margin-inline: auto;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background-color: var(--pf-t--global--background--color--primary--default);
  border-radius: var(--pf-t--global--border--radius--pill);
  filter: drop-shadow(0.05rem 0.2rem 0.2rem var(--pf-t--global--box-shadow--color--100));
  z-index: 10;

  // Every control is as high as a square icon button, whatever its PatternFly variant: the
  // Arrange menu toggle has text and padding of its own.
  --toolbar-control--size: var(--pf-t--global--spacer--xl);

  .toolbar-control {
    flex: none;
    justify-content: center;
    min-width: var(--toolbar-control--size);
    height: var(--toolbar-control--size);
    padding-block: 0;
  }

  .pf-v6-c-button.toolbar-control {
    width: var(--toolbar-control--size);
    padding-inline: 0;
  }

  .pf-v6-c-menu-toggle.toolbar-control {
    padding-inline: var(--pf-t--global--spacer--md);
  }

  .toolbar-divider {
    width: 1px;
    height: var(--pf-t--global--spacer--lg);
    margin: 0 var(--pf-t--global--spacer--xs);
    background: var(--pf-t--global--border--color--default);
  }

  // PatternFly's slider leaves room above and below its rail for ticks and labels; the toolbar
  // shows neither, so the slider fits in the height of a control.
  .zoom-slider {
    --pf-v6-c-slider__rail--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-slider__rail--PaddingBlockEnd: var(--pf-t--global--spacer--sm);
    --pf-v6-c-slider__thumb--InsetBlockStart: calc(
      var(--pf-v6-c-slider__rail-track--Height) / 2 + var(--pf-t--global--spacer--sm)
    );
    width: 6rem;
    margin-inline: var(--pf-t--global--spacer--sm);
  }

  .zoom-percentage {
    min-width: 2.5rem;
    color: var(--pf-t--global--text--color--subtle);
    font-size: var(--pf-t--global--font--size--body--sm);
    text-align: right;
  }
`;
