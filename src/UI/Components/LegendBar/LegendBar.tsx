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
 *
 * @param {string} props.label displayed when there are no items.
 */
export const LegendBar: React.FC<Props> = ({
  items,
  total,
  label,
  ...props
}) => {
  const totalValue = items
    .map((item) => item.value)
    .reduce((acc, cur) => acc + cur, 0);

  return (
    <Container {...props}>
      <Bar>
        {items.length <= 0 ? (
          <LoneItem key="none" label={label || ""} />
        ) : (
          items.map((item) => <Item key={item.id} {...item} />)
        )}
        {}
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
