import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownToggleAction,
  DropdownItem,
} from "@patternfly/react-core";
import { RemoteData } from "@/Core";

const recompile = "Recompile";
const updateAndRecompile = "Update project & recompile";

interface Props {
  compiling: RemoteData.RemoteData<string, boolean>;
  onRecompile(): void;
  onUpdateAndRecompile(): void;
}

export const CompileButton: React.FC<Props> = ({
  compiling,
  onRecompile,
  onUpdateAndRecompile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = (open: boolean) => setIsOpen(open);
  const onSelect = () => setIsOpen(false);
  return (
    <Dropdown
      aria-label="CompileButton"
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          aria-label="Toggle"
          splitButtonItems={[
            <DropdownToggleAction
              key="action"
              onClick={onRecompile}
              aria-label="Recompile"
            >
              {recompile}
            </DropdownToggleAction>,
          ]}
          splitButtonVariant="action"
          onToggle={onToggle}
          isDisabled={!RemoteData.isSuccess(compiling) || compiling.value}
        />
      }
      isOpen={isOpen}
      dropdownItems={[
        <DropdownItem
          aria-label="UpdateAndRecompile"
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
