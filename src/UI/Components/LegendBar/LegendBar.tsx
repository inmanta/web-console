import React from "react";
import styled from "styled-components";
import { Item, Props as ItemProps } from "./Item";
import { Total } from "./Total";

interface Props {
  items: ItemProps[];
  total?: Total;
}

export const LegendBar: React.FC<Props> = ({ items, total, ...props }) => {
  const totalValue = items
    .map((item) => item.value)
    .reduce((acc, cur) => acc + cur);
  return (
    <Container {...props}>
      <Bar>
        {items.map((item) => (
          <Item key={item.id} {...item} />
        ))}
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
