import React from "react";
import styled from "styled-components";
import { Item, Refs, Transform } from "@/UI/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props {
  items: Item[];
  refs: Refs;
  transform?: Transform;
}

export const ItemList: React.FC<Props> = ({ items, refs, transform }) => {
  return (
    <Container aria-label="DiffItemList">
      {items.map((item) => (
        <Block key={item.id} item={item} refs={refs} transform={transform} />
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
