import React from "react";
import {
  DropdownItem,
  DropdownList,
  Flex,
  Truncate,
} from "@patternfly/react-core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { Item, Refs } from "@/UI/Components/DiffWizard/types";

interface Props {
  items: Pick<Item, "id" | "status">[];
  refs: Refs;
}

export const SummaryList: React.FC<Props> = ({ items, refs }) => {
  const onSelect = (itemId: string) => {
    if (itemId === undefined) return;
    if (refs.current[itemId] === undefined) return;
    refs.current[itemId].scrollIntoView({
      behavior: "smooth",
    });
    refs.current[itemId].focus();
  };

  return (
    <DropdownList aria-label="DiffSummaryList">
      {items.map((item) => (
        <DropdownItem
          key={item.id}
          itemId={item.id}
          onClick={() => onSelect(item.id)}
          aria-label="DiffSummaryListItem"
        >
          <Descriptor {...item} />
        </DropdownItem>
      ))}
    </DropdownList>
  );
};

const Descriptor: React.FC<Pick<Item, "id" | "status">> = ({ id, status }) => {
  return (
    <Flex flexWrap={{ default: "nowrap" }}>
      <StatusDescriptor status={status} />
      <Truncate content={id} tooltipPosition="top" position="end" />
    </Flex>
  );
};
