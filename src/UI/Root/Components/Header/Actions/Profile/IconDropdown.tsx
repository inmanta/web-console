import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownPosition,
} from "@patternfly/react-core";

interface Props {
  icon: JSX.Element;
  dropdownItems: JSX.Element[];
}

export const IconDropdown: React.FC<Props> = ({ icon, dropdownItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = (): void => setIsOpen(!isOpen);

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          toggleIndicator={null}
          onToggle={setIsOpen}
          aria-label="Applications"
          isDisabled={dropdownItems.length === 0}
        >
          {icon}
        </DropdownToggle>
      }
      isOpen={isOpen}
      position={DropdownPosition.right}
      isPlain={true}
      dropdownItems={dropdownItems}
    />
  );
};
