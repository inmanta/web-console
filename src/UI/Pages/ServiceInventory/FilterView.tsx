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
} from "@patternfly/react-core";
import { Query, ServiceModel, toggleValueInList } from "@/Core";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { uniq } from "lodash";
import { AttributesFilter } from "./AttributesFilter";

interface FilterProps {
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

type Category = "State" | "Id" | "AttributeSet";

export const FilterView: React.FC<FilterProps> = ({
  filter,
  setFilter,
  service,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [category, setCategory] = useState<Category>("State");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [idInput, setIdInput] = useState("");

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
      <AttributesFilter
        isVisible={category === "AttributeSet"}
        emptySet={filter.attribute_set_empty || []}
        notEmptySet={filter.attribute_set_not_empty || []}
        updateEmptySet={(set) =>
          setFilter({ ...filter, attribute_set_empty: set })
        }
        updateNotEmptySet={(set) =>
          setFilter({ ...filter, attribute_set_not_empty: set })
        }
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
