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

export const Item: React.FC<Props> = ({
  value,
  label,
  backgroundColor,
  color,
  onClick,
  id,
}) => (
  <Tooltip content={label} position="auto" distance={4} enableFlip>
    <Container
      value={value}
      data-value={value}
      backgroundColor={backgroundColor}
      color={color}
      onClick={onClick ? () => onClick(id) : undefined}
      aria-label={`LegendItem-${id}`}
    >
      {value}
    </Container>
  </Tooltip>
);

const Container = styled.div<Omit<Props, "id" | "label">>`
  background-color: ${(p) => p.backgroundColor};
  color: ${(p) => p.color || "white"};
  flex-basis: auto;
  flex-grow: ${(p) => p.value};
  flex-shrink: ${(p) => p.value};
  height: 36px;
  text-align: center;
  line-height: 36px;
  padding: 0 8px;
  cursor: ${(p) => (p.onClick ? "pointer" : "text")};
  user-select: none;
`;
