import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Chip,
  ChipGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";

interface Props {
  selected: string[];
  setSelected: (selected: string | ((prevState: string[]) => string[])) => void;
  options: SelectOptionProps[];
  isDisabled?: boolean;
  toggleAriaLabel?: string;
  placeholderText?: string;
  onSearchTextChanged?: (value: string) => void;
  hasChips?: boolean;
  toggleIcon?: React.ReactNode;
}

export const MultiTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
  toggleAriaLabel,
  placeholderText,
  onSearchTextChanged = () => {},
  hasChips = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectOptions, setSelectOptions] =
    useState<SelectOptionProps[]>(options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = options;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = options.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(inputValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: false,
            children: `No results found for "${inputValue}"`,
            value: "no results",
          },
        ];
      }

      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setFocusedItemIndex(null);
    setActiveItem(null);
    onSearchTextChanged(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, options]);

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === "ArrowUp") {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === "ArrowDown") {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (
          focusedItemIndex === null ||
          focusedItemIndex === selectOptions.length - 1
        ) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[
        indexToFocus
      ];
      setActiveItem(
        `select-multi-typeahead-${focusedItem.value.replace(" ", "-")}`,
      );
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter(
      (menuItem) => !menuItem.isDisabled,
    );
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex
      ? enabledMenuItems[focusedItemIndex]
      : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case "Enter":
        if (!isOpen) {
          setIsOpen((prevIsOpen) => !prevIsOpen);
        } else if (isOpen && focusedItem.value !== "no results") {
          onSelect(focusedItem.value as string);
        }
        break;
      case "Tab":
      case "Escape":
        setIsOpen(false);
        setActiveItem(null);
        break;
      case "ArrowUp":
      case "ArrowDown":
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    onSearchTextChanged(value);
  };

  const onSelect = (value: string) => {
    if (value && value !== "no results") {
      setSelected(value);
    }

    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
      aria-label={toggleAriaLabel}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="multi-typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholderText || "Select..."}
          {...(activeItem && { "aria-activedescendant": activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-multi-typeahead-listbox"
          disabled={props.isDisabled}
        >
          {hasChips && (
            <ChipGroup aria-label="Current selections">
              {selected.map((selection, index) => (
                <Chip
                  disabled={props.isDisabled}
                  key={index}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelect(selection);
                  }}
                >
                  {selection}
                </Chip>
              ))}
            </ChipGroup>
          )}
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          {selected.length > 0 && (
            <Button
              disabled={props.isDisabled}
              variant="plain"
              onClick={() => {
                setInputValue("");
                setSelected([]);
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              {props.toggleIcon ? props.toggleIcon : <TimesIcon aria-hidden />}
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="multi-typeahead-select"
      isOpen={isOpen}
      selected={selected}
      onSelect={(_ev, selection) => onSelect(selection as string)}
      onOpenChange={() => setIsOpen(false)}
      toggle={toggle}
    >
      <SelectList isAriaMultiselectable id="select-multi-typeahead-listbox">
        {selectOptions.map((option, index) => (
          <SelectOption
            disabled={props.isDisabled}
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            className={option.className}
            id={`select-multi-typeahead-${option.value.replace(" ", "-")}`}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
    </Select>
  );
};
