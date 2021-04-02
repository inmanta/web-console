import React, { useState } from "react";
import {
  ToolbarGroup,
  ToolbarItem,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownPosition,
  ToolbarFilter,
  Select,
  SelectOption,
  InputGroup,
  TextInput,
  ButtonVariant,
  SelectVariant,
} from "@patternfly/react-core";
import { Query, ServiceModel, toggleValueInList } from "@/Core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { uniq } from "lodash";

interface FilterProps {
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

type AttributeSetSelectionKey =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

export const FilterView: React.FC<FilterProps> = ({
  filter,
  setFilter,
  service,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [category, setCategory] = useState("State");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [idInput, setIdInput] = useState("");

  const onCategorySelect = (newCategory: string) => {
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
          onCategorySelect((event?.target as HTMLElement).innerText);
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
    console.log({ cat, id });
    const name = cat.toString().toLowerCase();
    setFilter({
      ...filter,
      [name]: filter[name].filter((a) => a !== id),
    });
  };

  const onIdInput = (event) => {
    if (event.key && event.key !== "Enter") {
      return;
    }

    setFilter({
      ...filter,
      id: filter.id
        ? uniq(toggleValueInList(idInput, [...filter.id]))
        : [idInput],
    });
    setIdInput("");
  };

  const isDisabled = (
    kind: "Empty" | "Not Empty",
    set: "Active" | "Candidate" | "Rollback"
  ) => {
    if (kind === "Empty") {
      if (typeof filter.attribute_set_not_empty === "undefined") return false;
      return filter.attribute_set_not_empty.includes(Query.Attributes[set]);
    }

    if (typeof filter.attribute_set_empty === "undefined") return false;
    return filter.attribute_set_empty.includes(Query.Attributes[set]);
  };

  const onAttributeSelect = (event, selection) => {
    const currentEmpty = attributesListToSelection(
      "empty",
      getFromFilter("empty", filter)
    );
    const emptyList = attributeSelectionToAttributesList(
      "empty",
      toggleValueInList(selection, currentEmpty)
    );

    const currentNotEmpty = attributesListToSelection(
      "not empty",
      getFromFilter("not empty", filter)
    );

    const notEmptyList = attributeSelectionToAttributesList(
      "not empty",
      toggleValueInList(selection, currentNotEmpty)
    );

    setFilter({
      ...filter,
      attribute_set_empty: emptyList,
      attribute_set_not_empty: notEmptyList,
    });

    setIsFilterOpen(false);
  };

  const attributeSetFilter = (
    <ToolbarFilter
      chips={getAttributeSelectionFromFilter(filter)}
      // deleteChip={removeChip}
      categoryName="AttributeSet"
      showToolbarItem={category === "AttributeSet"}
    >
      <Select
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel="Select a state"
        onToggle={setIsFilterOpen}
        onSelect={onAttributeSelect}
        selections={getAttributeSelectionFromFilter(filter)}
        isOpen={isFilterOpen}
        placeholderText="Any"
        chipGroupProps={{ numChips: 0 }}
      >
        <SelectOption
          key={0}
          value="Active (empty)"
          isDisabled={isDisabled("Empty", "Active")}
        />
        <SelectOption
          key={1}
          value="Candidate (empty)"
          isDisabled={isDisabled("Empty", "Candidate")}
        />
        <SelectOption
          key={2}
          value="Rollback (empty)"
          isDisabled={isDisabled("Empty", "Rollback")}
        />
        <SelectOption
          key={3}
          value="Active (not empty)"
          isDisabled={isDisabled("Not Empty", "Active")}
        />
        <SelectOption
          key={4}
          value="Candidate (not empty)"
          isDisabled={isDisabled("Not Empty", "Candidate")}
        />
        <SelectOption
          key={5}
          value="Rollback (not empty)"
          isDisabled={isDisabled("Not Empty", "Rollback")}
        />
      </Select>
    </ToolbarFilter>
  );

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

  const idFilter = (
    <ToolbarFilter
      chips={filter.id}
      deleteChip={removeChip}
      categoryName="Id"
      showToolbarItem={category === "Id"}
    >
      <InputGroup>
        <TextInput
          name="idInput"
          id="idInput1"
          type="search"
          aria-label="id filter"
          onChange={setIdInput}
          value={idInput}
          placeholder="Filter by id..."
          onKeyDown={onIdInput}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={onIdInput}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );

  const filters = (
    <>
      {stateFilter}
      {idFilter}
      {attributeSetFilter}
    </>
  );

  return (
    <ToolbarGroup variant="filter-group">
      {filterSelector}
      {filters}
    </ToolbarGroup>
  );
};

function getAttributeSelectionFromFilter(
  filter: Query.Filter
): AttributeSetSelectionKey[] {
  if (typeof filter === "undefined") return [];
  let list: AttributeSetSelectionKey[] = [];
  if (typeof filter.attribute_set_empty !== "undefined") {
    list = [
      ...list,
      ...attributesListToSelection("empty", filter.attribute_set_empty),
    ];
  }
  if (typeof filter.attribute_set_not_empty !== "undefined") {
    list = [
      ...list,
      ...attributesListToSelection("not empty", filter.attribute_set_not_empty),
    ];
  }
  return list;
}

function attributesListToSelection(
  kind: "empty" | "not empty",
  list: Query.Attributes[]
): AttributeSetSelectionKey[] {
  return list.map((a) => {
    switch (a) {
      case Query.Attributes.Active:
        return `Active (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Candidate:
        return `Candidate (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Rollback:
        return `Rollback (${kind})` as AttributeSetSelectionKey;
    }
  });
}

function attributeSelectionToAttributesList(
  kind: "empty" | "not empty",
  list: AttributeSetSelectionKey[]
): Query.Attributes[] {
  if (list.length <= 0) return [];
  return list
    .map((value) => attributeToSelection(value))
    .filter(([, k]) => k === kind)
    .map(([attr]) => attr);
}

function attributeToSelection(
  selection: AttributeSetSelectionKey
): [Query.Attributes, "empty" | "not empty"] {
  switch (selection) {
    case "Active (empty)":
      return [Query.Attributes.Active, "empty"];
    case "Active (not empty)":
      return [Query.Attributes.Active, "not empty"];
    case "Candidate (empty)":
      return [Query.Attributes.Candidate, "empty"];
    case "Candidate (not empty)":
      return [Query.Attributes.Candidate, "not empty"];
    case "Rollback (empty)":
      return [Query.Attributes.Rollback, "empty"];
    case "Rollback (not empty)":
      return [Query.Attributes.Rollback, "not empty"];
  }
}

function getFromFilter(
  kind: "empty" | "not empty",
  filter: Query.Filter
): Query.Attributes[] {
  if (typeof filter === "undefined") return [];
  switch (kind) {
    case "empty": {
      if (typeof filter.attribute_set_empty === "undefined") return [];
      return filter.attribute_set_empty;
    }

    case "not empty": {
      if (typeof filter.attribute_set_not_empty === "undefined") return [];
      return filter.attribute_set_not_empty;
    }
  }
}
