import React from "react";
import { DataList } from "@patternfly/react-core";
import { Item, Refs } from "@/UI/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props {
  items: Item[];
  refs: Refs;
}

export const ItemList: React.FC<Props> = ({ items, refs }) => {
  return (
    <DataList isCompact aria-label="DiffItemList">
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
    </DataList>
  );
};
