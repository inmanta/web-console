import React, { useState } from "react";
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { CompareAction } from "./CompareAction";
import { DeleteAction } from "./DeleteAction";
import { PromoteAction } from "./PromoteAction";

interface Props {
  version: ParsedNumber;
  isPromoteDisabled: boolean;
}

export const Actions: React.FC<Props> = ({ version, isPromoteDisabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="actions-toggle"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        <DeleteAction key="delete" version={version} />
        <PromoteAction
          key="promote"
          version={version}
          isDisabled={isPromoteDisabled}
        />
        <CompareAction key="compare" version={Number(version)} />
      </DropdownList>
    </Dropdown>
  );
};
