import React from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { LogLevelsList } from "@/Core";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceActionFilter } from "@S/ResourceActions/Core/Domain";

interface Props {
  filter: ResourceActionFilter;
  setFilter: (filter: ResourceActionFilter) => void;
}

/**
 * Filters resource actions by minimal log severity.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The filter component.
 */
export const LogLevelFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const options: SelectOptionProps[] = LogLevelsList.map((option) => ({
    value: option,
    children: option,
  }));

  const onSelect = (selection: string | null) =>
    setFilter({
      ...filter,
      log_severity: !selection || filter.log_severity === selection ? undefined : selection,
    });

  return (
    <ToolbarFilter
      labels={filter.log_severity ? [filter.log_severity] : []}
      deleteLabel={() => setFilter({ ...filter, log_severity: undefined })}
      categoryName={words("resourceActions.filter.logLevel")}
    >
      <SingleTextSelect
        options={options}
        selected={filter.log_severity || null}
        setSelected={onSelect}
        toggleAriaLabel="LogSeverityFilter"
        placeholderText={words("resources.logs.logLevel.placeholder")}
      />
    </ToolbarFilter>
  );
};
