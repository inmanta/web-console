import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { Query, ServiceModel } from "@/Core";
import { AttributeSets, AttributesFilter } from "./AttributesFilter";
import { IdFilter } from "./IdFilter";
import { StateFilter } from "./StateFilter";
import { FilterKind, FilterPicker } from "./FilterPicker";
import { DeletedFilter } from "./DeletedFilter";

interface Props {
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

export const FilterBar: React.FC<Props> = ({ filter, setFilter, service }) => {
  const [filterKind, setFilterKind] = useState<FilterKind>("State");

  const updateState = (states: string[]) =>
    setFilter({ ...filter, state: states.length > 0 ? states : undefined });

  const updateId = (id?: string) =>
    id
      ? setFilter({ ...filter, id: [id] })
      : setFilter({ ...filter, id: undefined });

  const updateAttributes = ({ empty, notEmpty }: AttributeSets) =>
    setFilter({
      ...filter,
      attributeSetEmpty: empty,
      attributeSetNotEmpty: notEmpty,
    });

  const updateDeleted = (deleted: Query.Deleted) =>
    setFilter({ ...filter, deleted });

  return (
    <ToolbarGroup variant="filter-group">
      <FilterPicker setFilterKind={setFilterKind} filterKind={filterKind} />
      <StateFilter
        isVisible={filterKind === "State"}
        possibleStates={service.lifecycle.states.map((state) => state.name)}
        selectedStates={filter.state ? filter.state : []}
        update={updateState}
      />
      <IdFilter
        isVisible={filterKind === "Id"}
        id={filter.id ? filter.id[0] : undefined}
        update={updateId}
      />
      <AttributesFilter
        isVisible={filterKind === "AttributeSet"}
        sets={{
          empty: filter.attributeSetEmpty || [],
          notEmpty: filter.attributeSetNotEmpty || [],
        }}
        update={updateAttributes}
      />
      <DeletedFilter
        isVisible={filterKind === "Deleted"}
        update={updateDeleted}
        deleted={filter.deleted}
      />
    </ToolbarGroup>
  );
};
