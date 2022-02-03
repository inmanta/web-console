import React, { useState } from "react";
import {
  Select,
  SelectOption,
  SelectVariant,
  ToolbarFilter,
} from "@patternfly/react-core";
import { stringToBoolean } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  isVisible: boolean;
  success?: boolean;
  update: (success?: boolean) => void;
}

export const ResultFilter: React.FC<Props> = ({
  isVisible,
  update,
  success,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    if (stringToBoolean(selection) === success) {
      update(undefined);
    } else {
      update(selection);
    }
    setFilterOpen(false);
  };

  const removeChip = () => update(undefined);

  return (
    <ToolbarFilter
      chips={
        success !== undefined
          ? [
              success
                ? words("compileReports.filters.result.success")
                : words("compileReports.filters.result.failed"),
            ]
          : []
      }
      deleteChip={removeChip}
      categoryName="Result"
      showToolbarItem={isVisible}
    >
      <Select
        variant={SelectVariant.single}
        toggleAriaLabel="Select Result"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        selections={success !== undefined ? success.toString() : undefined}
        isOpen={isFilterOpen}
        placeholderText={words("compileReports.filters.result.placeholder")}
      >
        <SelectOption value="true" aria-label="Successful">
          {words("compileReports.filters.result.success")}
        </SelectOption>
        <SelectOption value="false" aria-label="Not Successful">
          {words("compileReports.filters.result.failed")}
        </SelectOption>
      </Select>
    </ToolbarFilter>
  );
};
