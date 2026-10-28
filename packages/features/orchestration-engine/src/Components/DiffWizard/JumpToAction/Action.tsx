import React, { useState } from "react";
import { Dropdown, MenuToggle, MenuToggleElement } from "@patternfly/react-core";

import { words } from "@inmanta/web-console-core";
import {
  Item,
  Refs,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
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
      onOpenChange={(open) => setIsOpen(open)}
      isScrollable
      popperProps={{ preventOverflow: true, maxWidth: "800px" }}
      toggle={(toggleref: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleref} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
          {words("jumpTo")}
        </MenuToggle>
      )}
      isOpen={isOpen}
    >
      <SummaryList items={items} refs={refs} />
    </Dropdown>
  );
};

export const EmptyJumpToAction: React.FC = () => (
  <Dropdown
    toggle={(toggleref: React.Ref<MenuToggleElement>) => (
      <MenuToggle ref={toggleref} isDisabled></MenuToggle>
    )}
  ></Dropdown>
);
