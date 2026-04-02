import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";

/**
 * @param id must be unique
 */
export interface Props {
  id: string;
  value: number;
  label?: string;
  backgroundColor: string;
  color?: string;
  onClick?(id: string): void;
  height?: string;
  isEmpty?: boolean;
}

/**
 * Renders a legend item with a tooltip.
 *
 * @param {Props} props - The component props.
 * @prop {string} id - The id of the item.
 * @prop {number} value - The value of the item.
 * @prop {string} label - The label of the item.
 * @prop {string} backgroundColor - The background color of the item.
 * @prop {string} color - The color of the item.
 * @prop {string} height - Height of the legendItem.
 * @prop {boolean} isEmpty - Whether the item is a placeholder with no data.
 * @prop {() => void} onClick - The function to call when the item is clicked.
 */
export const Item: React.FC<Props> = ({
  value,
  label,
  backgroundColor,
  color,
  onClick,
  id,
  height = "36px",
  isEmpty = false,
}) => {
  const container = (
    <Container
      value={value}
      data-value={value}
      $backgroundColor={backgroundColor}
      $color={color}
      $height={height}
      $isEmpty={isEmpty}
      onClick={onClick ? () => onClick(id) : undefined}
      aria-label={`LegendItem-${id}`}
    >
      {value}
    </Container>
  );

  if (!label) return container;

  return (
    <Tooltip content={label} position="top" distance={4} enableFlip>
      {container}
    </Tooltip>
  );
};

/**
 * Styled container for the legend item.
 *
 * @param {Props} props - The component props.
 * @prop {number} value - The value of the item.
 * @prop {string} $backgroundColor - The background color of the item.
 * @prop {string} $color - The color of the item.
 * @prop {string} $height - Height of the legendItem.
 * @prop {boolean} $isEmpty - Whether the item is a placeholder with no data.
 * @prop {() => void} onClick - The function to call when the item is clicked.
 */
export const Container = styled.div<{
  value: number;
  $backgroundColor: string;
  $color?: string;
  $height?: string;
  $isEmpty?: boolean;
  onClick?: () => void;
}>`
  background-color: ${(p) => p.$backgroundColor};
  color: ${(p) => p.$color || "white"};
  flex-basis: auto;
  flex-grow: ${(p) => (p.$isEmpty ? 1 : p.value)};
  flex-shrink: ${(p) => (p.$isEmpty ? 1 : p.value)};
  height: ${(p) => p.$height};
  text-align: center;
  line-height: ${(p) => p.$height};
  padding: 0 8px;
  cursor: ${(p) => (p.onClick ? "pointer" : "inherit")};
  user-select: none;
`;
