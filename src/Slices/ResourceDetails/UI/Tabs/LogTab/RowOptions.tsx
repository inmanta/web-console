import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon, FilterIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

export type ToggleActionType = (actionType: string) => void;

export const RowOptions: React.FC<{
  toggleActionType: ToggleActionType;
  action: string;
}> = ({ toggleActionType, action }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      popperProps={{ position: "center" }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="repair-deploy-dropdown"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      isOpen={isOpen}
    >
      <DropdownItem
        key="filterOnActionType"
        onClick={() => toggleActionType(action)}
        icon={<FilterIcon />}
      >
        {words("resources.logs.filterOnAction")(action)}
      </DropdownItem>
    </Dropdown>
  );
};
