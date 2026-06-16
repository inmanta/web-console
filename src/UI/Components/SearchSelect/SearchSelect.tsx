import React, { useRef, useState } from "react";
import {
  Divider,
  Menu,
  MenuContainer,
  MenuContent,
  MenuList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
  SelectOption,
  SelectOptionProps,
} from "@patternfly/react-core";
import { words } from "@/UI";

export const TEST_IDS = {
  toggle: "swm-toggle",
  input: "swm-input",
};

export interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOptionProps[];
}

/**
 * A searchable select dropdown following the PatternFly "inline search filter" menu pattern.
 *
 * The toggle button shows the currently selected value. When opened, a search field at the
 * top of the dropdown filters the option list in real time (case-insensitive substring match
 * on the option value only). Options can be plain strings, or objects following PatternFly’s {@link SelectOptionProps} —
 * pass {@link SelectOptionProps.children} to control what is rendered in the option row
 * (e.g. version + styled timestamp); search always filters only on the plain value.
 * Selecting an option calls {@link SearchSelectProps.onChange} and closes the menu.
 * Typing a query that yields no matches shows a disabled "No results found" item.
 *
 * @param {SearchSelectProps} props - Component props.
 * @returns {React.ReactElement} The rendered select menu.
 */
export function SearchSelect({ value, onChange, options }: SearchSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined
  ) => {
    onChange(String(itemId ?? ""));
    setIsOpen(false);
    setSearchValue("");
  };

  const handleSearchChange = (val: string) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setSearchValue(val);
  };

  const menuItems = options
    .filter((option) => String(option.value).toLowerCase().includes(searchValue.toLowerCase()))
    .map((option) => (
      <SelectOption key={option.value} itemId={option.value}>
        {option.children ?? option.value}
      </SelectOption>
    ));

  if (searchValue && menuItems.length === 0) {
    menuItems.push(
      <SelectOption isDisabled key="no result">
        {words("noResults")}
      </SelectOption>
    );
  }

  const selectedOption = options.find((o) => String(o.value) === value);

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      data-testid={TEST_IDS.toggle}
      onClick={() => setIsOpen((o) => !o)}
      isExpanded={isOpen}
      isFullWidth
    >
      {(selectedOption?.children ?? value) || words("instanceDetails.searchPlaceholder")}
    </MenuToggle>
  );

  const menu = (
    <Menu ref={menuRef} onSelect={handleSelect} activeItemId={value} isScrollable>
      <MenuSearch>
        <MenuSearchInput>
          <SearchInput
            value={searchValue}
            aria-label={words("instanceDetails.searchPlaceholder")}
            placeholder={words("instanceDetails.searchPlaceholder")}
            onChange={(_event, val) => handleSearchChange(val)}
            onClear={(event) => {
              event.stopPropagation();
              handleSearchChange("");
            }}
            data-testid={TEST_IDS.input}
          />
        </MenuSearchInput>
      </MenuSearch>
      <Divider />
      <MenuContent maxMenuHeight="200px">
        <MenuList>{menuItems}</MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <MenuContainer
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onOpenChangeKeys={["Escape"]}
    />
  );
}
