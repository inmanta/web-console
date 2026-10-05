import { DescriptionListGroup } from "@patternfly/react-core";
import styled from "styled-components";

/** Description list group that counts as a row for RowHoverReveal. */
export const HoverRowGroup = styled(DescriptionListGroup)``;

/** Block that counts as a row for RowHoverReveal, for a line that is not a table row or list group. */
export const HoverRow = styled.div``;

/**
 * Hides its content until the surrounding table row, HoverRowGroup or HoverRow is hovered. It also
 * shows on focus, while a menu inside it is open, outside a row, and on devices without hover.
 * Hovering a row also hovers the rows around it, so keep it in a row without nested rows.
 */
export const RowHoverReveal = styled.span`
  display: inline-flex;
  margin-inline-start: var(--pf-t--global--spacer--xs);

  @media (hover: hover) {
    transition: opacity 150ms ease;

    tr:not(:hover) &:not(:focus-within):not(:has([aria-expanded="true"])),
    ${HoverRowGroup}:not(:hover) &:not(:focus-within):not(:has([aria-expanded="true"])),
    ${HoverRow}:not(:hover) &:not(:focus-within):not(:has([aria-expanded="true"])) {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
