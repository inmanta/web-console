import React from "react";
import { DataList } from "@patternfly/react-core";
import { Classification, Item, Refs } from "@/UI/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props {
  items: Item[];
  refs: Refs;
}

/**
 * Shows the hash of a file resource as a file, every other attribute as is. Defined once, so the
 * rows keep the same props and skip re-rendering when the list does.
 *
 * @example classify("std::File[a,path=/x]", "hash") // "File"
 */
const classify = (title: string, attribute: string): Classification =>
  title.startsWith("std::File") && attribute === "hash" ? "File" : "Default";

export const ItemList: React.FC<Props> = ({ items, refs }) => {
  return (
    <DataList isCompact aria-label="DiffItemList">
      {items.map((item) => (
        <Block key={item.id} item={item} refs={refs} classify={classify} />
      ))}
    </DataList>
  );
};
