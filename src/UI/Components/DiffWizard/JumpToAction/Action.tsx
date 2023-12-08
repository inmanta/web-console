import React, { useState } from "react";
import {
  Dropdown,
  MenuToggle,
  MenuToggleElement,
  Spinner,
} from "@patternfly/react-core";

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
      toggle={(toggleref: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleref}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
        >
          {words("jumpTo")}
        </MenuToggle>
      )}
      isOpen={isOpen}
    >
      <SummaryList items={items} refs={refs} />
    </Dropdown>
  );
};

export const LoadingJumpToAction: React.FC = () => (
  <Dropdown
    toggle={(toggleref: React.Ref<MenuToggleElement>) => (
      <MenuToggle ref={toggleref} isDisabled>
        <Spinner size="sm" />
      </MenuToggle>
    )}
  ></Dropdown>
);

export const EmptyJumpToAction: React.FC = () => (
  <Dropdown
    toggle={(toggleref: React.Ref<MenuToggleElement>) => (
      <MenuToggle ref={toggleref} isDisabled></MenuToggle>
    )}
  ></Dropdown>
);
