import React, { useId, useRef, useState } from "react";
import {
  Button,
  FormGroup,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Flex,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from "@patternfly/react-core";
import { PlusIcon, TimesIcon } from "@patternfly/react-icons";
import { Spinner } from "@/UI/Components";

export interface AddableSelectOption {
  value: string;
  label: string;
}

export interface AddableSelectInputProps {
  label: string;
  placeholder?: string;
  options: AddableSelectOption[];
  onAdd: (value: string) => void;
  onFilter: (value: string) => void;
  onReachEnd: () => void;
  onToggleInputMode: () => void;
  toggleLabel: string;
  isLoading: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
}

/**
 * The AddableSelectInput component.
 *
 * Provides a typeahead select input paired with a control button to append values to a filter category.
 * Clicking the input opens the full options list; typing filters it via the onFilter callback.
 * Scrolling to the bottom of the list triggers onReachEnd for paginated option loading.
 * Shared building block for the filter drawers; all display text is supplied through props.
 *
 * @Props {AddableSelectInputProps} - Component props.
 *  @prop {string} label - Label shown above the select field.
 *  @prop {string} [placeholder] - Optional placeholder text shown in the input when no value is entered.
 *  @prop {AddableSelectOption[]} options - The list of selectable options.
 *  @prop {(value: string) => void} onAdd - Callback executed with the current input value when the add action is triggered.
 *  @prop {(value: string) => void} onFilter - Callback executed when the search input value changes, used to filter options externally.
 *  @prop {() => void} onReachEnd - Callback executed when the menu scroll reaches near the end, used to load more options.
 *  @prop {() => void} onToggleInputMode - Callback executed whenever we press on the labelInfo of the FormGroup.
 *  @prop {string} toggleLabel - Label for the input-mode toggle link.
 *  @prop {boolean} isLoading - Whether options are currently being loaded; shows a spinner entry at the bottom of the list.
 *  @prop {string} [loadingLabel] - Text shown next to the spinner while options load.
 *  @prop {string} [emptyLabel] - Text shown when there are no options and nothing is loading.
 * @returns {React.ReactElement} The rendered addable select input.
 */
export const AddableSelectInput: React.FC<AddableSelectInputProps> = ({
  label,
  placeholder,
  options,
  onAdd,
  onFilter,
  onReachEnd,
  onToggleInputMode,
  toggleLabel,
  isLoading,
  loadingLabel,
  emptyLabel,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const selectId = useId();
  const textInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilter = (next: string) => {
    setFilterValue(next);
    onFilter(next);
    setFocusedItemIndex(null);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (value: string) => {
    setFilterValue(value);
    onFilter(value);
    setIsOpen(false);
    setFocusedItemIndex(null);
    textInputRef.current?.focus();
  };

  const handleAdd = () => {
    if (!filterValue.trim()) {
      return;
    }
    onAdd(filterValue.trim());
    setFilterValue("");
    onFilter("");
    setIsOpen(false);
    setFocusedItemIndex(null);
  };

  const handleMenuArrowKeys = (key: string) => {
    if (!isOpen) {
      return;
    }

    setFocusedItemIndex((prev) => {
      if (key === "ArrowDown") {
        return prev === null || prev === options.length - 1 ? 0 : prev + 1;
      }
      if (key === "ArrowUp") {
        return prev === null || prev === 0 ? options.length - 1 : prev - 1;
      }

      return prev;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Escape":
        setIsOpen(false);
        setFocusedItemIndex(null);
        break;

      case "ArrowDown":
        event.preventDefault();

        if (!isOpen) {
          setIsOpen(true);
          setFocusedItemIndex(0);
        } else {
          handleMenuArrowKeys("ArrowDown");
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        handleMenuArrowKeys("ArrowUp");
        break;

      case "Enter":
        if (focusedItemIndex !== null && options[focusedItemIndex]) {
          handleSelect(options[focusedItemIndex].value);
        } else {
          handleAdd();
        }
        break;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

    if (isBottom) {
      onReachEnd();
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      isExpanded={isOpen}
      isFullWidth
      onClick={() => setIsOpen((prev) => !prev)}
      aria-label={`${label}-menuToggle`}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={filterValue}
          placeholder={placeholder}
          onChange={(_e, val) => handleFilter(val)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
          innerRef={textInputRef}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={`${selectId}-listbox`}
          aria-label={`${label}-input`}
          id={selectId}
          data-testid="search-input"
        />
        <TextInputGroupUtilities>
          {filterValue && (
            <Button
              variant="plain"
              icon={<TimesIcon aria-hidden />}
              aria-label="clear-button"
              onClick={() => {
                setFilterValue("");
                onFilter("");
                setIsOpen(false);
                textInputRef.current?.focus();
              }}
            />
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <FormGroup
      label={label}
      fieldId={selectId}
      labelInfo={
        <Button
          variant="link"
          isInline
          onClick={() => {
            onToggleInputMode();
            onFilter("");
          }}
        >
          {toggleLabel}
        </Button>
      }
    >
      <InputGroup>
        <InputGroupItem isFill>
          <Select
            id={`${selectId}-select`}
            isOpen={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setFocusedItemIndex(null);
              }
            }}
            onSelect={(_e, value) => handleSelect(String(value))}
            toggle={toggle}
            popperProps={{ appendTo: "inline" }}
          >
            <SelectList
              id={`${selectId}-listbox`}
              aria-label={`${label} options`}
              isAriaMultiselectable={false}
              onScroll={handleScroll}
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {options.map((option, index) => (
                <SelectOption
                  key={option.value}
                  value={option.value}
                  isFocused={index === focusedItemIndex}
                  style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                >
                  {option.label}
                </SelectOption>
              ))}

              {isLoading && (
                <SelectOption value="__loading__" isDisabled>
                  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                    {loadingLabel}
                    <Spinner />
                  </Flex>
                </SelectOption>
              )}

              {options.length === 0 && !isLoading && (
                <SelectOption value="__empty__" isDisabled>
                  {emptyLabel}
                </SelectOption>
              )}
            </SelectList>
          </Select>
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            onClick={handleAdd}
            isDisabled={!filterValue}
            data-testid="add-button"
            aria-label={`Add filter-${label}`}
          >
            <PlusIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};
