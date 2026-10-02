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
  height?: string;
  isEmpty?: boolean;

  /** Marks the item as a pressed toggle with a bold value. Leave unset for items that are not toggles. */
  isActive?: boolean;

  /** Fades the item, for example when it is left out of the active filters. Default false. */
  isDimmed?: boolean;
}

/**
 * Renders a legend item with a tooltip.
 * With an onClick it becomes a keyboard-reachable button, and `isActive` exposes it as a pressed toggle.
 *
 * @param {Props} props - The component props.
 * @prop {string} id - The id of the item.
 * @prop {number} value - The value of the item.
 * @prop {string} label - The label of the item.
 * @prop {string} backgroundColor - The background color of the item.
 * @prop {string} color - The color of the item.
 * @prop {string} height - Height of the legendItem.
 * @prop {boolean} isEmpty - Whether the item is a placeholder with no data.
 * @prop {boolean} isActive - Whether the toggle is pressed, unset when the item is not a toggle.
 * @prop {boolean} isDimmed - Whether the item is faded.
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
  isActive,
  isDimmed = false,
}) => {
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <Tooltip content={label} position="top" distance={4} enableFlip>
      <Container
        value={value}
        data-value={value}
        $backgroundColor={backgroundColor}
        $color={color}
        $height={height}
        $isEmpty={isEmpty}
        $isActive={isActive}
        $isDimmed={isDimmed}
        onClick={onClick ? () => onClick(id) : undefined}
        onKeyDown={onClick ? onKeyDown : undefined}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? isActive : undefined}
        aria-label={`LegendItem-${id}`}
      >
        {value}
      </Container>
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
 * @prop {boolean} $isActive - Whether the item is part of the active filters.
 * @prop {boolean} $isDimmed - Whether the item is faded.
 * @prop {() => void} onClick - The function to call when the item is clicked.
 */
export const Container = styled.div<{
  value: number;
  $backgroundColor: string;
  $color?: string;
  $height?: string;
  $isEmpty?: boolean;
  $isActive?: boolean;
  $isDimmed?: boolean;
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
  opacity: ${(p) => (p.$isDimmed ? 0.35 : 1)};
  font-weight: ${(p) => (p.$isActive ? "bold" : "inherit")};
  cursor: ${(p) => (p.onClick ? "pointer" : "inherit")};

  &:focus-visible {
    outline: 2px solid var(--pf-t--global--border--color--clicked);
    outline-offset: -2px;
  }
  user-select: none;
`;
