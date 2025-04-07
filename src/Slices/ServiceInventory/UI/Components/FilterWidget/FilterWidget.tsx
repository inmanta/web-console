import React, { useState } from 'react';
import { ToolbarGroup } from '@patternfly/react-core';
import { ServiceInstanceParams } from '@/Core';
import { FilterPicker } from '@/UI/Components';
import { SelectOptionFilter } from '@/UI/Components/Filters';
import { words } from '@/UI/words';
import { AttributeSets, AttributesFilter } from './AttributesFilter';
import { DeletedFilter } from './DeletedFilter';
import { IdFilter } from './IdFilter';

interface Props {
  filter: ServiceInstanceParams.Filter;
  setFilter: (filter: ServiceInstanceParams.Filter) => void;
  states: string[];
  identityAttribute?: { key: string; pretty: string };
}

export const FilterWidget: React.FC<Props> = ({
  filter,
  setFilter,
  states,
}) => {
  const [filterKind, setFilterKind] = useState<ServiceInstanceParams.Kind>(
    ServiceInstanceParams.Kind.Id,
  );

  const updateState = (states: string[]) =>
    setFilter({ ...filter, state: states.length > 0 ? states : undefined });

  const updateId = (id?: string) =>
    id
      ? setFilter({ ...filter, id_or_service_identity: [id] })
      : setFilter({ ...filter, id_or_service_identity: undefined });

  const updateAttributes = ({ empty, notEmpty }: AttributeSets) =>
    setFilter({
      ...filter,
      attributeSetEmpty: empty,
      attributeSetNotEmpty: notEmpty,
    });

  const updateDeleted = (deleted: ServiceInstanceParams.DeletedRule) =>
    setFilter({ ...filter, deleted });

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar" role="toolbar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        items={ServiceInstanceParams.List}
      />
      <SelectOptionFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.State}
        filterPropertyName={ServiceInstanceParams.Kind.State}
        placeholder={words('inventory.filters.state.placeholder')}
        possibleStates={states}
        selectedStates={filter.state ? filter.state : []}
        update={updateState}
      />
      <IdFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.Id}
        id={
          filter.id_or_service_identity
            ? filter.id_or_service_identity[0]
            : undefined
        }
        update={updateId}
      />
      <AttributesFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.AttributeSet}
        sets={{
          empty: filter.attributeSetEmpty || [],
          notEmpty: filter.attributeSetNotEmpty || [],
        }}
        update={updateAttributes}
      />
      <DeletedFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.Deleted}
        update={updateDeleted}
        deleted={filter.deleted}
      />
    </ToolbarGroup>
  );
};
