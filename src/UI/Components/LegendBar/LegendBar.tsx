import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";

/**
 * @param id must be unique
 */
export interface LegendItem {
  id: string;
  value: number;
  label: string;
  backgroundColor: string;
  color?: string;
  onClick?(id: string): void;
}

interface Props {
  items: LegendItem[];
  formatTotal?(total: number): string;
}

export const LegendBar: React.FC<Props> = ({ items, formatTotal }) => {
  const total = items.map((item) => item.value).reduce((acc, cur) => acc + cur);
  return (
    <Container>
      <Bar>
        {items.map((item) => (
          <BarItem key={item.id} {...item} />
        ))}
      </Bar>
      {formatTotal && <Total>{formatTotal(total)}</Total>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
`;

const Total = styled.div`
  padding: 0 16px;
  line-height: 36px;
`;

const BarItem: React.FC<LegendItem> = ({
  value,
  label,
  backgroundColor,
  color,
  onClick,
  id,
}) => (
  <Tooltip content={label} position="auto" distance={4} enableFlip>
    <BarItemContainer
      value={value}
      backgroundColor={backgroundColor}
      color={color}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      {value}
    </BarItemContainer>
  </Tooltip>
);

const Bar = styled.div`
  flex-grow: 1;
  display: inline-flex;
  border-radius: 2px;
  overflow: hidden;
`;

const BarItemContainer = styled.div<Omit<LegendItem, "id" | "label">>`
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
`;
