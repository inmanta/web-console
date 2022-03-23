import React from "react";
import { ToolbarFilter } from "@patternfly/react-core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { Severity, severityList } from "@S/Notification/Core/Model";
import { Filter } from "@S/Notification/Core/Query";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const SeverityFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (severity: Severity) =>
    setFilter({
      ...filter,
      severity: filter.severity === severity ? undefined : severity,
    });

  const onSelect = (selection) => {
    update(selection === null ? undefined : selection);
  };

  const deleteChip = () =>
    setFilter({
      ...filter,
      severity: undefined,
    });

  return (
    <ToolbarFilter
      chips={filter.severity ? [filter.severity] : []}
      deleteChip={deleteChip}
      categoryName="Severity"
    >
      <SingleTextSelect
        aria-label="SeverityOptions"
        options={severityList}
        selected={filter.severity || null}
        setSelected={onSelect}
        toggleAriaLabel="Severity"
        placeholderText={words("notification.severity.placeholder")}
      />
    </ToolbarFilter>
  );
};
