import React, { useEffect, useRef, useState } from "react";
import {
  Button,
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
  selected: string | null;
  setSelected: (selected: string | null) => void;
  onSearchTextChanged?: (value: string) => void;
  onCreate?: (value: string) => void;
  options: SelectOptionProps[];
  isDisabled?: boolean;
  toggleAriaLabel?: string;
  placeholderText?: string;
  hasCreation?: boolean;
  toggleIcon?: React.ReactNode;
}

export const SingleTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
  toggleAriaLabel,
  placeholderText,
  hasCreation = false,
  onCreate = () => {},
  onSearchTextChanged = () => {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [selectOptions, setSelectOptions] =
    useState<SelectOptionProps[]>(options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = options;

    if (filterValue) {
      newSelectOptions = options.filter((option) => {
        return String(option.children)
          .toLowerCase()
          .includes(filterValue.toLocaleLowerCase());
      });

      if (!newSelectOptions.length && !hasCreation) {
        newSelectOptions = [
          {
            isDisabled: false,
            children: `No results found for "${filterValue}"`,
            value: "no results",
          },
        ];
      }

      if (!newSelectOptions.length && hasCreation) {
        newSelectOptions = [
          { children: `Create new option "${inputValue}"`, value: "create" },
        ];
      }

      if (
        options.some(
          (option) =>
            option.children?.toLocaleString() ===
            filterValue.toLocaleLowerCase(),
        )
      ) {
        setSelected(filterValue as string);
      }

      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
    onSearchTextChanged(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const getDisplayValue = (value: string | number | undefined) => {
    const selectedItem = options.find((option) => option.value === value);

    return selectedItem?.children || value;
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value && value !== "no results") {
      setFilterValue("");
      if (value === "create") {
        setSelected(inputValue);
        onCreate(inputValue);
      } else {
        setInputValue(getDisplayValue(value) as string);
        setSelected(value as string);
      }
    }

    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
    setFilterValue(value);
  };

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
      setActiveItem(`select-typeahead-${focusedItem.value.replace(" ", "-")}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter(
      (option) => !option.isDisabled,
    );
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex
      ? enabledMenuItems[focusedItemIndex]
      : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case "Enter":
        if (isOpen && focusedItem.value !== "no results") {
          setInputValue(String(focusedItem.children));
          setFilterValue("");
          setSelected(String(focusedItem.children));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
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
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholderText}
          {...(activeItem && { "aria-activedescendant": activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
          disabled={props.isDisabled}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setSelected("");
                setInputValue("");
                setFilterValue("");
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
              disabled={props.isDisabled}
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
      id="typeahead-select"
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={() => {
        setIsOpen(false);
      }}
      toggle={toggle}
      selected={selected}
    >
      <SelectList id="select-typeahead-listbox">
        {selectOptions.map((option, index) => (
          <SelectOption
            isDisabled={props.isDisabled}
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            isSelected={option.isSelected}
            className={option.className}
            onClick={() => setSelected(option.value)}
            id={`select-typeahead-${option.value.replace(" ", "-")}`}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
    </Select>
  );
};
