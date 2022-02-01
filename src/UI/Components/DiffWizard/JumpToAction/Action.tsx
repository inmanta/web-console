import React, { useState } from "react";
import { Dropdown, DropdownToggle, Spinner } from "@patternfly/react-core";
import { DiffItem, Refs } from "../types";
import { SummaryList } from "./SummaryList";

interface Props {
  items: Pick<DiffItem, "id" | "status">[];
  refs: Refs;
}

export const JumpToAction: React.FC<Props> = ({ items, refs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={
        <DropdownToggle onToggle={() => setIsOpen(!isOpen)}>
          Jump to
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
