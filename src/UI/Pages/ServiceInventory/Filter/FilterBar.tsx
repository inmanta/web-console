import React, { useState } from "react";
import { ToolbarGroup } from "@patternfly/react-core";
import { Query, ServiceModel } from "@/Core";
import { AttributeSets, AttributesFilter } from "./AttributesFilter";
import { IdFilter } from "./IdFilter";
import { StateFilter } from "./StateFilter";
import { FilterKind, FilterPicker } from "./FilterPicker";

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
      attribute_set_empty: empty,
      attribute_set_not_empty: notEmpty,
    });

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
          empty: filter.attribute_set_empty || [],
          notEmpty: filter.attribute_set_not_empty || [],
        }}
        update={updateAttributes}
      />
    </ToolbarGroup>
  );
};
