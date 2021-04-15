import React, { useState } from "react";
import {
  ToolbarGroup,
  ToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
  ToolbarFilter,
  Select,
  SelectOption,
} from "@patternfly/react-core";
import { Query, ServiceModel, toggleValueInList } from "@/Core";
import { FilterIcon } from "@patternfly/react-icons";
import { uniq } from "lodash";
import { AttributeSets, AttributesFilter } from "./AttributesFilter";
import { IdFilter } from "./IdFilter";

interface FilterProps {
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

type Category = "State" | "Id" | "AttributeSet";

export const FilterBar: React.FC<FilterProps> = ({
  filter,
  setFilter,
  service,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [category, setCategory] = useState<Category>("State");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onCategorySelect = (newCategory: Category) => {
    setCategory(newCategory);
    setIsCategoryOpen(false);
  };

  const onStateSelect = (event, selection) => {
    setFilter({
      ...filter,
      state: filter.state
        ? uniq(toggleValueInList(selection, [...filter.state]))
        : [selection],
    });
    setIsFilterOpen(false);
  };

  const filterSelector = (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => {
          onCategorySelect(
            (event?.target as HTMLElement).innerText as Category
          );
        }}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={setIsCategoryOpen}
            style={{ width: "100%" }}
          >
            <FilterIcon /> {category}
          </DropdownToggle>
        }
        isOpen={isCategoryOpen}
        dropdownItems={[
          <DropdownItem key="cat1">State</DropdownItem>,
          <DropdownItem key="cat2">Id</DropdownItem>,
          <DropdownItem key="cat3">AttributeSet</DropdownItem>,
        ]}
        style={{ width: "100%" }}
      ></Dropdown>
    </ToolbarItem>
  );

  const states = service.lifecycle.states.map((state) => state.name);

  const removeChip = (cat, id) => {
    const name = cat.toString().toLowerCase();
    setFilter({
      ...filter,
      [name]: filter[name].filter((a) => a !== id),
    });
  };

  const stateFilter = (
    <ToolbarFilter
      chips={filter.state}
      deleteChip={removeChip}
      categoryName="State"
      showToolbarItem={category === "State"}
    >
      <Select
        aria-label="State"
        onToggle={setIsFilterOpen}
        onSelect={onStateSelect}
        selections={filter.state}
        isOpen={isFilterOpen}
        placeholderText="Any"
        variant="typeaheadmulti"
        chipGroupProps={{ numChips: 0 }}
      >
        {states.map((state) => (
          <SelectOption key={state} value={state} />
        ))}
      </Select>
    </ToolbarFilter>
  );

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

  const filters = (
    <>
      {stateFilter}
      <IdFilter
        isVisible={category === "Id"}
        id={filter.id ? filter.id[0] : undefined}
        update={updateId}
      />
      <AttributesFilter
        isVisible={category === "AttributeSet"}
        sets={{
          empty: filter.attribute_set_empty || [],
          notEmpty: filter.attribute_set_not_empty || [],
        }}
        update={updateAttributes}
      />
    </>
  );

  return (
    <ToolbarGroup variant="filter-group">
      {filterSelector}
      {filters}
    </ToolbarGroup>
  );
};
