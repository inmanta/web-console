import React, { useState } from "react";
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
  ToolbarFilter,
} from "@patternfly/react-core";
import { ServiceInstanceParams } from "@/Core";

interface Props {
  isVisible: boolean;
  deleted: ServiceInstanceParams.DeletedRule;
  update: (deleted: ServiceInstanceParams.DeletedRule) => void;
}

export const DeletedFilter: React.FC<Props> = ({
  isVisible,
  update,
  deleted,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    if (selection === deleted) {
      update(undefined);
    } else {
      update(selection);
    }
    setFilterOpen(false);
  };

  const removeChip = () => update(undefined);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(val) => setFilterOpen(val)}
      isExpanded={isFilterOpen}
      aria-label="Select Deleted"
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {deleted || "Select a rule..."}
    </MenuToggle>
  );

  return (
    <ToolbarFilter
      chips={deleted ? [deleted] : []}
      deleteChip={removeChip}
      categoryName="Deleted"
      showToolbarItem={isVisible}
    >
      <Select
        toggle={toggle}
        onSelect={onSelect}
        selected={deleted}
        isOpen={isFilterOpen}
        onOpenChange={(isOpen) => setFilterOpen(isOpen)}
      >
        <SelectOption
          value="Include"
          description="Also include deleted instances"
          aria-label="Include"
        >
          Include
        </SelectOption>
        <SelectOption
          value="Only"
          description="Only show deleted instances"
          aria-label="Only"
        >
          Only
        </SelectOption>
      </Select>
    </ToolbarFilter>
  );
};
