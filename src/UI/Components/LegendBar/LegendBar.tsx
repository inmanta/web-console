import React from "react";
import styled from "styled-components";
import { Item, Props as ItemProps } from "./Item";
import { LoneItem } from "./LoneItem";
import { Total } from "./Total";

interface Props {
  items: ItemProps[];
  total?: Total;
  label?: string;
}

/**
 * @param {string} props.label displayed when there are no items.
 * @param {Total} props.total displayed when there are no items.
 * @param {ItemProps[]} props.items Items that render a legend item.
 */

export const LegendBar: React.FC<Props> = ({ items, total, label, ...props }) => {
  const totalValue = items.map((item) => item.value).reduce((acc, cur) => acc + cur, 0);

  return (
    <Container {...props}>
      <Bar data-testid="legend-bar-items">
        {items.length <= 0 ? (
          <LoneItem key="none" label={label || ""} />
        ) : (
          items.map((item) => <Item key={item.id} {...item} height="20px" />)
        )}
      </Bar>
      {total && <Total total={total} value={totalValue} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
`;

const Bar = styled.div`
  flex-grow: 1;
  display: inline-flex;
  border-radius: 2px;
  overflow: hidden;
`;
