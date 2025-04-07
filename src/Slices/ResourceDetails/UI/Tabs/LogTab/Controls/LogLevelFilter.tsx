import React from 'react';
import { SelectOptionProps, ToolbarFilter } from '@patternfly/react-core';
import { LogLevelsList } from '@/Core';
import { SingleTextSelect } from '@/UI/Components';
import { words } from '@/UI/words';
import { ResourceLogFilter } from '@S/ResourceDetails/Core/ResourceLog';

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const LogLevelFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const options: SelectOptionProps[] = LogLevelsList.map((option) => {
    return { value: option, children: option };
  });
  const update = (level: string) =>
    setFilter({
      ...filter,
      minimal_log_level: filter.minimal_log_level === level ? undefined : level,
    });

  const onSelect = (selection) => {
    update(selection === null || selection === '' ? undefined : selection);
  };

  const deleteChip = () =>
    setFilter({
      ...filter,
      minimal_log_level: undefined,
    });

  return (
    <ToolbarFilter
      labels={filter.minimal_log_level ? [filter.minimal_log_level] : []}
      deleteLabel={deleteChip}
      categoryName="Minimal Log Level"
    >
      <SingleTextSelect
        options={options}
        selected={filter.minimal_log_level || null}
        setSelected={onSelect}
        toggleAriaLabel="MinimalLogLevel"
        placeholderText={words('resources.logs.logLevel.placeholder')}
      />
    </ToolbarFilter>
  );
};
