import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";

export interface SearchSelectProps<T extends string = string> {
  value: T | string;
  onChange: (value: string) => void;
  options: T[];
  placeholder?: string;
  filterStrategy?: "startsWith" | "includes" | "all" | ((option: string, value: string) => boolean);
  maxItems?: number;
}

export const TEST_IDS = {
  input: "swd-input",
  menu: "swd-menu",
  menuItem: (option: string) => `swd-item-${option}`,
};

/**
 * The SearchSelect component.
 *
 * Provides a searchable typeahead select input with a dropdown menu.
 * Supports filtering strategies (startsWith, includes, all, or custom function),
 * optional result limiting, and prioritization of exact matches.
 *
 * @template T - The type of selectable option strings.
 *
 * @props {SearchSelectProps<T>} - Component props.
 *  @prop {T | string} value - Current input value controlling the component.
 *  @prop {(value: string) => void} onChange - Callback triggered when the input value changes or an option is selected.
 *  @prop {T[]} options - List of selectable options.
 *  @prop {string} [placeholder] - Placeholder text shown in the input field.
 *  @prop {"startsWith" | "includes" | "all" | ((option: string, value: string) => boolean)} [filterStrategy]
 *    - Strategy used to filter options based on input.
 *      - "startsWith": matches options beginning with the input
 *      - "includes": matches options containing the input
 *      - "all": disables filtering
 *      - function: custom filtering logic
 *  @prop {number} [maxItems] - Maximum number of items to display in the dropdown.
 *
 * @returns {React.ReactElement} The rendered searchable select menu component.
 */
export function SearchSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Search or select…",
  filterStrategy = "startsWith",
  maxItems,
}: SearchSelectProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filter = useCallback(
    (option: string, value: string): boolean => {
      if (!value) {
        return true;
      }

      if (typeof filterStrategy === "function") {
        return filterStrategy(option, value);
      }

      const lower = value.toLowerCase();

      if (filterStrategy === "all") {
        return true;
      }

      if (filterStrategy === "includes") {
        return option.toLowerCase().includes(lower);
      }

      return option.toLowerCase().startsWith(lower);
    },
    [filterStrategy]
  );

  const filtered = useMemo(() => {
    // First apply the filtering strategy to all options based on the current value
    const filteredAll = options.filter((option) => filter(option, value));

    // If there is no input value, just return a truncated list (if maxItems is set)
    // This avoids unnecessary prioritization or sorting work
    if (!value) {
      return filteredAll.slice(0, maxItems ?? options.length);
    }

    // Try to find an exact match (case-insensitive) so it can be prioritized
    const exact = filteredAll.find((option) => option.toLowerCase() === value.toLowerCase());

    // If an exact match exists, move it to the top of the list
    // Otherwise, keep the original filtered order
    const prioritized = exact
      ? [exact, ...filteredAll.filter((option) => option !== exact)]
      : filteredAll;

    // Finally, apply max item limit if provided
    return prioritized.slice(0, maxItems ?? options.length);
  }, [options, value, filter, maxItems]);

  const handleSearchChange = (_event: React.FormEvent<HTMLInputElement>, val: string) => {
    onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (
    _event: React.MouseEvent | undefined,
    selected: string | number | undefined
  ) => {
    onChange(String(selected ?? ""));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={() => setIsOpen((o) => !o)}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={value}
          onClick={() => setIsOpen(true)}
          onChange={(event, val) => handleSearchChange(event, val)}
          innerRef={inputRef}
          placeholder={placeholder}
          role="combobox"
          isExpanded={isOpen}
          inputProps={{
            "data-testid": TEST_IDS.input,
            onFocus: () => setIsOpen(true),
          }}
        />
        <TextInputGroupUtilities {...(!value ? { style: { display: "none" } } : {})}>
          <Button variant="plain" onClick={handleClear} aria-label="Reset" icon={<TimesIcon />} />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={value}
      onSelect={handleSelect}
      onOpenChange={setIsOpen}
      toggle={toggle}
      variant="typeahead"
      data-testid={TEST_IDS.menu}
    >
      <SelectList>
        {filtered.map((option) => (
          <SelectOption
            key={option}
            aria-label={TEST_IDS.menuItem(option)}
            value={option}
            isSelected={option === value}
          >
            {option}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}
