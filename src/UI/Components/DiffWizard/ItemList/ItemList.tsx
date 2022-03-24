import React from "react";
import styled from "styled-components";
import { Item, Refs } from "@/UI/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props {
  items: Item[];
  refs: Refs;
}

export const ItemList: React.FC<Props> = ({ items, refs }) => {
  return (
    <Container aria-label="DiffItemList">
      {items.map((item) => (
        <Block
          key={item.id}
          item={item}
          refs={refs}
          classify={(title, attribute) =>
            title.startsWith("std::File") && attribute === "hash"
              ? "File"
              : "Default"
          }
        />
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
