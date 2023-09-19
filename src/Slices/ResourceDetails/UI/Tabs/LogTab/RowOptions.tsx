import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from "@patternfly/react-core/deprecated";
import { FilterIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@/UI/words";

export type ToggleActionType = (actionType: string) => void;

export const RowOptions: React.FC<{
  toggleActionType: ToggleActionType;
  action: string;
}> = ({ toggleActionType, action }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      position={DropdownPosition.right}
      onSelect={() => setIsOpen(false)}
      toggle={
        <StyledKebabToggle
          onToggle={() => setIsOpen(!isOpen)}
          id="toggle-id-6"
        />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          key="filterOnActionType"
          onClick={() => toggleActionType(action)}
          icon={<FilterIcon />}
        >
          {words("resources.logs.filterOnAction")(action)}
        </DropdownItem>,
      ]}
    />
  );
};

const StyledKebabToggle = styled(KebabToggle)`
  padding-top: 0;
  padding-bottom: 0;
`;
