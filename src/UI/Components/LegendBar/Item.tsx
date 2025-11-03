import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";

/**
 * @param id must be unique
 */
export interface Props {
  id: string;
  value: number;
  label: string;
  backgroundColor: string;
  color?: string;
  onClick?(id: string): void;
}

/**
 * Renders a legend item with a tooltip.
 *
 * @param {Props} props - The component props.
 * @prop {string} id - The id of the item.
 * @prop {number} value - The value of the item.
 * @prop {string} label - The label of the item.
 * @prop {string} backgroundColor - The background color of the item.
 */
export const Item: React.FC<Props> = ({ value, label, backgroundColor, color, onClick, id }) => (
  <Tooltip content={label} position="top" distance={4} enableFlip>
    <Container
      value={value}
      data-value={value}
      $backgroundColor={backgroundColor}
      $color={color}
      onClick={onClick ? () => onClick(id) : undefined}
      aria-label={`LegendItem-${id}`}
    >
      {value}
    </Container>
  </Tooltip>
);

/**
 * Styled container for the legend item.
 *
 * @param {Props} props - The component props.
 * @prop {number} value - The value of the item.
 * @prop {string} $backgroundColor - The background color of the item.
 * @prop {string} $color - The color of the item.
 * @prop {() => void} onClick - The function to call when the item is clicked.
 */
export const Container = styled.div<{
  value: number;
  $backgroundColor: string;
  $color?: string;
  onClick?: () => void;
}>`
  background-color: ${(p) => p.$backgroundColor};
  color: ${(p) => p.$color || "white"};
  flex-basis: auto;
  flex-grow: ${(p) => p.value};
  flex-shrink: ${(p) => p.value};
  height: 36px;
  text-align: center;
  line-height: 36px;
  padding: 0 8px;
  cursor: ${(p) => (p.onClick ? "pointer" : "inherit")};
  user-select: none;
`;
