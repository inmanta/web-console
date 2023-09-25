import React, { useState } from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import {
  Select,
  SelectOption,
  SelectVariant,
} from "@patternfly/react-core/deprecated";
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

  return (
    <ToolbarFilter
      chips={deleted ? [deleted] : []}
      deleteChip={removeChip}
      categoryName="Deleted"
      showToolbarItem={isVisible}
    >
      <Select
        variant={SelectVariant.single}
        toggleAriaLabel="Select Deleted"
        onToggle={(_event, val) => setFilterOpen(val)}
        onSelect={onSelect}
        selections={deleted}
        isOpen={isFilterOpen}
        placeholderText="Select a rule..."
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
