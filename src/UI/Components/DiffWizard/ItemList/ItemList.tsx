import React from "react";
import { Flex } from "@patternfly/react-core";
import { Item, Refs } from "@/UI/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props {
  items: Item[];
  refs: Refs;
}

export const ItemList: React.FC<Props> = ({ items, refs }) => {
  return (
    <Flex direction={{ default: "column" }} aria-label="DiffItemList">
      {items.map((item) => (
        <Block
          key={item.id}
          item={item}
          refs={refs}
          classify={(title, attribute) =>
            title.startsWith("std::File") && attribute === "hash" ? "File" : "Default"
          }
        />
      ))}
    </Flex>
  );
};
