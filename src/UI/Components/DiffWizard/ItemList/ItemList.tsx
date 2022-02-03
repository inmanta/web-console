import React from "react";
import styled from "styled-components";
import { DiffItem, Refs } from "../types";
import { Block } from "./Block";

interface Props {
  items: DiffItem[];
  refs: Refs;
}

export const ItemList: React.FC<Props> = ({ items, refs }) => {
  return (
    <Container aria-label="DiffItemList">
      {items.map((item) => (
        <Block key={item.id} item={item} refs={refs} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;
