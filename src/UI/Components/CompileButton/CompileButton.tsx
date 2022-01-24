import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownToggleAction,
  DropdownItem,
} from "@patternfly/react-core";

const recompile = "Recompile";
const updateAndRecompile = "Update project & recompile";

export const CompileButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = (open) => setIsOpen(open);
  const onRecompile = () => alert("recompile");
  const onUpdateAndRecompile = () => alert("update and recompile");
  const onSelect = () => setIsOpen(false);
  return (
    <Dropdown
      aria-label="CompileButton"
      role="button"
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          splitButtonItems={[
            <DropdownToggleAction key="action" onClick={onRecompile}>
              {recompile}
            </DropdownToggleAction>,
          ]}
          splitButtonVariant="action"
          onToggle={onToggle}
          isDisabled={false}
        />
      }
      isOpen={isOpen}
      dropdownItems={[
        <DropdownItem
          key="action"
          component="button"
          onClick={onUpdateAndRecompile}
        >
          {updateAndRecompile}
        </DropdownItem>,
      ]}
    />
  );
};
