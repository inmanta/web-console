import styled from "styled-components";
import { LEFT_SIDEBAR_WIDTH, RIGHT_SIDEBAR_OFFSET } from "../config";

/**
 * The strip of the canvas the toolbar sits in: between the palette and the details panel, so the
 * toolbar never overlaps them. The toolbar fits its controls to the strip's width (a container
 * query), so a narrow canvas drops the slider first, then the zoom percentage and the Arrange
 * label. The strip itself lets clicks through to the canvas.
 */
export const ZoomControlsBand = styled.div`
  position: absolute;
  bottom: 25px;
  left: ${LEFT_SIDEBAR_WIDTH}px;
  right: ${RIGHT_SIDEBAR_OFFSET}px;
  display: flex;
  justify-content: center;
  padding-inline: var(--pf-t--global--spacer--sm);
  pointer-events: none;
  container: zoom-band / inline-size;
  z-index: 10;

  // Narrower than the whole toolbar (about 30.5rem): no slider; the buttons still zoom.
  @container zoom-band (max-width: 31rem) {
    .zoom-slider {
      display: none;
    }
  }

  // Narrower than that (about 23rem): no dividers, only the Arrange icon (the toggle keeps its
  // name), and less padding. The zoom percentage stays, as the only sign of the zoom level.
  @container zoom-band (max-width: 23.5rem) {
    .arrange-label,
    .toolbar-divider {
      display: none;
    }

    .zoom-toolbar {
      padding-inline: var(--pf-t--global--spacer--sm);
    }
  }

  // Too narrow even for that (about 17rem): no zoom percentage either.
  @container zoom-band (max-width: 17.5rem) {
    .zoom-percentage {
      display: none;
    }
  }
`;

export const ZoomControlsContainer = styled.div`
  pointer-events: auto;
  max-width: 100%;
  display: flex;
  // A last resort on a very narrow canvas, rather than running under the sidebars.
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 1rem;
  background-color: var(--pf-t--global--background--color--primary--default);
  border-radius: var(--pf-t--global--border--radius--pill);
  filter: drop-shadow(0.05rem 0.2rem 0.2rem var(--pf-t--global--box-shadow--color--100));

  // Every control is a square icon button's height, through PatternFly's own sizing: the block
  // padding leaves exactly the control size around one line of text, whatever the variant. The
  // Arrange menu toggle keeps its inline padding for its text; the icon buttons have none and
  // centre their icon, so they are as wide as they are high (the button's minimum width).
  --toolbar-control--size: var(--pf-t--global--spacer--xl);
  --toolbar-control--padding-block: calc((var(--toolbar-control--size) - 1lh) / 2);

  .pf-v6-c-button.toolbar-control {
    --pf-v6-c-button--AlignItems: center;
    --pf-v6-c-button--PaddingBlockStart: var(--toolbar-control--padding-block);
    --pf-v6-c-button--PaddingBlockEnd: var(--toolbar-control--padding-block);
    --pf-v6-c-button--m-control--PaddingInlineStart: 0;
    --pf-v6-c-button--m-control--PaddingInlineEnd: 0;
  }

  .pf-v6-c-menu-toggle.toolbar-control {
    --pf-v6-c-menu-toggle--PaddingBlockStart: var(--toolbar-control--padding-block);
    --pf-v6-c-menu-toggle--PaddingBlockEnd: var(--toolbar-control--padding-block);
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
