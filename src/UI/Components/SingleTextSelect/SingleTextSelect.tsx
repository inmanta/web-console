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
  setSelected: (selected: string) => void;
  onSearchTextChanged?: (value: string) => void;
  onCreate?: (value: string) => void;
  options: SelectOptionProps[];
  isDisabled?: boolean;
  toggleAriaLabel?: string;
  placeholderText?: string;
  hasCreation?: boolean;
  toggleIcon?: React.ReactNode;
}

/**
 * The implementation mostly follows the suggested implementation from PF5.
 * Except that the selected state is handled at a higher level in our case.
 *
 * @param selected string value of the selected value
 * @param setSelected state callback method
 * @param options SelectOptionProps[]
 * @param isDisabled disabled state of the component
 * @param toggleAriaLabel aria-label that is propagated on toggle and input field
 * @param placeholderText text displayed as a placeholder in the input field
 * @param onSearchTextChanged callback function to handle input change events
 * @param hasCreation Wheter the component supports creating a new option when it's not yet available in the list
 * @param onCreate callback state function when the user selects to create a new option
 * @param toggleIcon Custom Icon component if you want a different toggleIcon
 *
 * @returns SingleTextSelect Component
 */
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
  const [inputValue, setInputValue] = useState<string>(selected || "");
  const [filterValue, setFilterValue] = useState("");
  const [selectOptions, setSelectOptions] =
    useState<SelectOptionProps[]>(options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (filterValue && !isOpen) {
      setIsOpen(true);
    }

    if (filterValue && hasCreation && filterValue.trim()) {
      let newSelectOptions: SelectOptionProps[] = options;
      newSelectOptions = options.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
      );

      if (
        !checkIfOptionMatchInput(options, filterValue) ||
        !newSelectOptions.length
      ) {
        newSelectOptions = [
          { children: `Create "${filterValue}"`, value: "create" },
          ...newSelectOptions,
        ];
      }

      setSelectOptions(newSelectOptions);
    }

    setActiveItem(null);
    setFocusedItemIndex(null);
    onSearchTextChanged(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  useEffect(() => {
    if (options.length === 0 && !hasCreation) {
      setSelectOptions([
        {
          children: `No results found for "${filterValue}"`,
          value: "no results",
          isDisabled: true,
        },
      ]);
    } else if (
      options.length === 0 &&
      hasCreation &&
      filterValue.trim() != ""
    ) {
      setSelectOptions([
        { children: `Create "${inputValue}"`, value: "create" },
      ]);
    } else {
      setSelectOptions(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    setInputValue(getDisplayValue(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const getDisplayValue = (value: string | null) => {
    const selectedItem = options.find((option) => option.value === value);

    if (selectedItem && selectedItem.children) {
      return selectedItem.children as string;
    }

    return value || "";
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    switch (value) {
      case "create":
        onCreate(inputValue);
        setFilterValue(inputValue);
        setSelected(inputValue);
        break;
      default:
        if (value && value !== "no results") {
          setFilterValue("");
          setInputValue(getDisplayValue(value as string));
          setSelected(value as string);
        }
        break;
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
          //   setInputValue(String(focusedItem.children));
          setFilterValue("");
          setSelected(String(focusedItem.children));
        }

        if (checkIfOptionMatchInput(options, filterValue)) {
          setSelected(filterValue as string);
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
      data-testid={`${toggleAriaLabel}-toggle`}
      isDisabled={props.isDisabled}
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
          aria-label={`${toggleAriaLabel}FilterInput`}
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

export const checkIfOptionMatchInput = (
  options: SelectOptionProps[],
  input: string,
) => {
  return options.some(
    (option) => option.children?.toLocaleString() === input.toLocaleLowerCase(),
  );
};
