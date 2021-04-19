import React, { useState } from "react";
import {
  Select,
  SelectOption,
  SelectVariant,
  ToolbarFilter,
} from "@patternfly/react-core";
import { Query } from "@/Core";

interface Props {
  isVisible: boolean;
  deleted: Query.DeletedRule;
  update: (deleted: Query.DeletedRule) => void;
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
        aria-label="Select Deleted"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        selections={deleted}
        isOpen={isFilterOpen}
        placeholderText="Select a rule..."
      >
        <SelectOption
          value="Include"
          description="Also include deleted instances"
        >
          Include
        </SelectOption>
        <SelectOption value="Only" description="Only show deleted instances">
          Only
        </SelectOption>
      </Select>
    </ToolbarFilter>
  );
};
