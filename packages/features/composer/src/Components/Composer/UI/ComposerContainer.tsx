import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { COMPOSER_MIN_HEIGHT } from "../config";

/**
 * The page frame wraps its content, so it ends where the composer page's content ends. While the
 * composer is on the page, the frame grows to the bottom of the window instead, like PatternFly's
 * own `pf-m-fill` frame, and the composer fills the space below the title. A window too short for
 * the composer's minimum height scrolls the page section.
 */
const FillPageFrame = createGlobalStyle`
  .pf-v6-c-page__main-container:has(#canvas-wrapper) {
    flex-grow: 1;
  }
`;

/**
 * The composer's frame: the palette, the canvas and the details side by side, as high as the
 * page leaves room for. The palette and the details scroll on their own.
 */
export const ComposerContainer: React.FC<React.ComponentPropsWithoutRef<"div">> = (props) => (
  <>
    <FillPageFrame />
    <Container {...props} />
  </>
);

const Container = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-height: ${COMPOSER_MIN_HEIGHT}px;
  border-radius: var(--pf-t--global--border--radius--small);
  color: var(--pf-t--global--text--color--regular);
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--pf-t--global--border--color--default);

  // Full screen (the zoom toolbar) puts the whole document in full screen, so what PatternFly
  // renders in the document body, like popovers, menus and toasts, still shows. The shell's
  // page frame hides its banners, masthead and sidebar then; the composer covers the rest.
  :root:fullscreen & {
    position: fixed;
    inset: 0;
    z-index: var(--pf-t--global--z-index--lg);
    border: 0;
    border-radius: 0;
    background: var(--pf-t--global--background--color--primary--default);
  }
`;
