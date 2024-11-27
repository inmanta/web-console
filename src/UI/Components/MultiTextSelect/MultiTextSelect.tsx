import React, { useEffect, useRef, useState } from "react";
import {
  Label,
  LabelGroup,
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
import { checkIfOptionMatchInput } from "../SingleTextSelect";

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
  noInputField?: boolean;
  footer?: React.ReactNode;
}

/**
 * The implementation mostly follows the suggested implementation from PF5.
 * Except that the selected state is handled at a higher level in our case.
 *
 * @param selected string[] of selected elements
 * @param setSelected state callback method
 * @param options SelectOptionProps[]
 * @param isDisabled disabled state of the component
 * @param toggleAriaLabel aria-label that is propagated on toggle and input field
 * @param placeholderText text displayed as a placeholder in the input field
 * @param onSearchTextChanged callback function to handle input change events.
 * @param hasChips Wheter chips should be displayed or not.
 * @param toggleIcon Custom Icon component if you want a different toggleIcon
 * @param noInputField To have a default select without filter-input field.
 * @param footer Component containing a footer element for the list
 *
 * @returns MultiTextSelect Component
 */
export const MultiTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
  toggleAriaLabel,
  placeholderText,
  onSearchTextChanged = () => {},
  hasChips = false,
  noInputField = false,
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
    if (inputValue && !isOpen) {
      setIsOpen(true);
    }

    setFocusedItemIndex(null);
    setActiveItem(null);
    onSearchTextChanged(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  useEffect(() => {
    if (options.length === 0) {
      setSelectOptions([
        {
          children: `No results found for "${inputValue}"`,
          value: "no results",
          isDisabled: true,
        },
      ]);
    } else {
      setSelectOptions(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const getDisplayValue = (value: string | number | undefined) => {
    const selectedItem = options.find((option) => option.value === value);

    return selectedItem?.children || value;
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
        if (inputValue && checkIfOptionMatchInput(options, inputValue)) {
          onSelect(inputValue);
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
  };

  const onSelect = (value: string) => {
    if (value && value !== "no results") {
      setSelected(value as string);
    }

    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant={noInputField ? "default" : "typeahead"}
      onClick={onToggleClick}
      ref={toggleRef}
      isExpanded={isOpen}
      isFullWidth
      aria-label={toggleAriaLabel}
    >
      {noInputField ? (
        placeholderText
      ) : (
        <TextInputGroup isPlain>
          <TextInputGroupMain
            value={inputValue}
            onClick={onToggleClick}
            onChange={onTextInputChange}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            innerRef={textInputRef}
            placeholder={placeholderText || "Select..."}
            {...(activeItem && { "aria-activedescendant": activeItem })}
            role="combobox"
            isExpanded={isOpen}
            aria-controls={`select-listbox-${toggleAriaLabel}`}
            aria-label={`${toggleAriaLabel}FilterInput`}
            disabled={props.isDisabled}
          >
            {hasChips && (
              <LabelGroup aria-label="Current selections" numLabels={0}>
                {selected.map((selection) => (
                  <Label
                    variant="outline"
                    disabled={props.isDisabled}
                    key={selection}
                    onClose={(ev) => {
                      ev.stopPropagation();
                      onSelect(selection);
                    }}
                  >
                    {getDisplayValue(selection)}
                  </Label>
                ))}
              </LabelGroup>
            )}
          </TextInputGroupMain>
          <TextInputGroupUtilities>
            {selected.length > 0 && (
              <Button
                icon={
                  props.toggleIcon ? (
                    props.toggleIcon
                  ) : (
                    <TimesIcon aria-hidden />
                  )
                }
                disabled={props.isDisabled}
                variant="plain"
                onClick={() => {
                  setInputValue("");
                  textInputRef?.current?.focus();
                }}
                aria-label="Clear input value"
              />
            )}
          </TextInputGroupUtilities>
        </TextInputGroup>
      )}
    </MenuToggle>
  );

  return (
    <Select
      id={`multi-select-${toggleAriaLabel}`}
      isOpen={isOpen}
      onSelect={(_ev, selection) => onSelect(selection as string)}
      onOpenChange={() => setIsOpen(false)}
      toggle={toggle}
    >
      <SelectList
        isAriaMultiselectable
        id={`select-listbox-${toggleAriaLabel}`}
        aria-label={`${toggleAriaLabel}Options`}
      >
        {selectOptions.map((option, index) => (
          <SelectOption
            disabled={props.isDisabled}
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            isSelected={option.isSelected}
            className={option.className}
            id={`select-multi-typeahead-${option.value.replace(" ", "-")}`}
            aria-label={`${option.value || option.children}`}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
      {props.footer}
    </Select>
  );
};
