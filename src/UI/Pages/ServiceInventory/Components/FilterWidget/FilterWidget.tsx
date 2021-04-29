import React, { useState } from "react";
import { ServiceInstanceParams } from "@/Core";
import { AttributeSets, AttributesFilter } from "./AttributesFilter";
import { IdFilter } from "./IdFilter";
import { SelectOptionFilter } from "@/UI/Components/Filters";
import { FilterPicker } from "./FilterPicker";
import { DeletedFilter } from "./DeletedFilter";
import { IdentityFilter } from "./IdentityFilter";
import { ToolbarGroup } from "@patternfly/react-core";

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
  identityAttribute,
}) => {
  const [filterKind, setFilterKind] = useState<ServiceInstanceParams.Kind>(
    ServiceInstanceParams.Kind.State
  );

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

  const updateDeleted = (deleted: ServiceInstanceParams.DeletedRule) =>
    setFilter({ ...filter, deleted });

  const updateIdentity = (value?: string) => {
    setFilter({
      ...filter,
      identity:
        value && identityAttribute
          ? { value, key: identityAttribute.key }
          : undefined,
    });
  };

  return (
    <ToolbarGroup variant="filter-group" aria-label="FilterBar">
      <FilterPicker
        setFilterKind={setFilterKind}
        filterKind={filterKind}
        identityAttributePretty={identityAttribute?.pretty}
      />
      <SelectOptionFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.State}
        possibleStates={states}
        selectedStates={filter.state ? filter.state : []}
        update={updateState}
      />
      <IdFilter
        isVisible={filterKind === ServiceInstanceParams.Kind.Id}
        id={filter.id ? filter.id[0] : undefined}
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
      {identityAttribute ? (
        <IdentityFilter
          identity={{
            pretty: identityAttribute.pretty,
            value: filter.identity?.value,
          }}
          isVisible={filterKind === identityAttribute.pretty}
          update={updateIdentity}
        />
      ) : null}
    </ToolbarGroup>
  );
};
