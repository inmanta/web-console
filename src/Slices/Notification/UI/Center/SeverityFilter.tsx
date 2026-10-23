import React from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { words } from "@/Core";
import { NotificationFilter } from "@/Data/Queries/Slices/Notification";
import { SingleTextSelect } from "@/UI/Components/SingleTextSelect";
import { severityList } from "@S/Notification/Core/Domain";

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const SeverityFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const options: SelectOptionProps[] = severityList.map((option) => {
    return { value: option, children: option };
  });
  const onSelect = (selection) => {
    setFilter({
      ...filter,
      severity: selection === "" ? undefined : selection,
    });
  };

  const deleteChip = () =>
    setFilter({
      ...filter,
      severity: undefined,
    });

  return (
    <ToolbarFilter
      labels={filter.severity ? [filter.severity] : []}
      deleteLabel={deleteChip}
      categoryName="Severity"
    >
      <SingleTextSelect
        aria-label="SeverityOptions"
        options={options}
        selected={filter.severity || null}
        setSelected={onSelect}
        toggleAriaLabel="Severity"
        placeholderText={words("notification.severity.placeholder")}
      />
    </ToolbarFilter>
  );
};
