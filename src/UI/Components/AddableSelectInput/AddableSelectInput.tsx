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
  Spinner,
  Flex,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from "@patternfly/react-core";
import { PlusIcon, TimesIcon } from "@patternfly/react-icons";

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
  onToggleInputMode?: () => void;
  toggleLabel?: string;
  isLoading: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  isDisabled?: boolean;
}

/**
 * The AddableSelectInput component.
 *
 * A strict typeahead paired with a control button to append values to a filter category. Typing
 * filters the options list; clicking the input opens it. A value can only be added when the typed
 * text exactly matches an option - the add button and Enter stay inert otherwise, so free-form
 * values cannot be added here. Adding emits the matched option's value while the input shows its
 * label, so a value that differs from its label (e.g. an id shown as a name) is preserved.
 * Scrolling to the bottom of the list triggers onReachEnd for paginated option loading.
 * Shared building block for the filter drawers; all display text is supplied through props.
 *
 * @Props {AddableSelectInputProps} - Component props.
 *  @prop {string} label - Label shown above the select field.
 *  @prop {string} [placeholder] - Optional placeholder text shown in the input when no value is entered.
 *  @prop {AddableSelectOption[]} options - The list of selectable options.
 *  @prop {(value: string) => void} onAdd - Callback executed with the matched option's value when the add action is triggered.
 *  @prop {(value: string) => void} onFilter - Callback executed when the search input value changes, used to filter options externally.
 *  @prop {() => void} onReachEnd - Callback executed when the menu scroll reaches near the end, used to load more options.
 *  @prop {() => void} [onToggleInputMode] - Callback executed when the labelInfo toggle is pressed; the toggle link only renders when this and toggleLabel are set.
 *  @prop {string} [toggleLabel] - Label for the input-mode toggle link; the toggle only renders when this and onToggleInputMode are set.
 *  @prop {boolean} isLoading - Whether options are currently being loaded; shows a spinner entry at the bottom of the list.
 *  @prop {string} [loadingLabel] - Text shown next to the spinner while options load.
 *  @prop {string} [emptyLabel] - Text shown when there are no options and nothing is loading.
 *  @prop {boolean} [isDisabled] - Whether the input and its add button are disabled (e.g. until a prerequisite filter is chosen).
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
  isDisabled = false,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const selectId = useId();
  const textInputRef = useRef<HTMLInputElement | null>(null);

  // A value is only addable when the input exactly matches one of the options.
  const matchedOption = options.find((option) => option.label === filterValue);

  const handleFilter = (next: string) => {
    setFilterValue(next);
    onFilter(next);
    setFocusedItemIndex(null);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option: AddableSelectOption) => {
    setFilterValue(option.label);
    onFilter(option.label);
    setIsOpen(false);
    setFocusedItemIndex(null);
    textInputRef.current?.focus();
  };

  const handleAdd = () => {
    if (!matchedOption) {
      return;
    }
    onAdd(matchedOption.value);
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
          handleSelect(options[focusedItemIndex]);
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
      isDisabled={isDisabled}
      onClick={() => setIsOpen((prev) => !prev)}
      aria-label={`${label}-menuToggle`}
    >
      <TextInputGroup isPlain isDisabled={isDisabled}>
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
        onToggleInputMode && toggleLabel ? (
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
        ) : undefined
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
            onSelect={(_e, value) => {
              const option = options.find((item) => item.value === String(value));

              if (option) {
                handleSelect(option);
              }
            }}
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
                    <Spinner size="sm" />
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
            isDisabled={!matchedOption || isDisabled}
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
