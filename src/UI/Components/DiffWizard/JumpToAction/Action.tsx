import React, { useState } from "react";
import { Dropdown, DropdownToggle, Spinner } from "@patternfly/react-core";
import { Item, Refs } from "@/UI/Components/DiffWizard/types";
import { words } from "@/UI/words";
import { SummaryList } from "./SummaryList";

interface Props {
  items: Pick<Item, "id" | "status">[];
  refs: Refs;
}

export const JumpToAction: React.FC<Props> = ({ items, refs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={
        <DropdownToggle onToggle={() => setIsOpen(!isOpen)}>
          {words("jumpTo")}
        </DropdownToggle>
      }
      isOpen={isOpen}
    >
      <SummaryList items={items} refs={refs} />
    </Dropdown>
  );
};

export const LoadingJumpToAction: React.FC = () => (
  <Dropdown
    toggle={
      <DropdownToggle isDisabled>
        <Spinner isSVG size="sm" />
      </DropdownToggle>
    }
  ></Dropdown>
);

export const EmptyJumpToAction: React.FC = () => (
  <Dropdown toggle={<DropdownToggle isDisabled />}></Dropdown>
);
