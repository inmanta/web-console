import React, { useEffect, forwardRef } from "react";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  Popper,
} from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  suggestions: string[];
  filter: string;
  handleSuggestionClick: (suggestion: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Renders a popover component that displays suggestions based on user input in the referenced field.
 *
 * @component
 * @example
 * // Usage
 * <SuggestionsPopover
 *   suggestions={["apple", "banana", "cherry"]}
 *   handleSuggestionClick={(suggestion) => console.log(suggestion)}
 *   filter="a"
 *   setIsOpen={setIsOpen}
 *   isOpen={isOpen}
 *   ref={inputRef}
 * />
 *
 * @param {Object} props - The component props.
 * @param {string[]} props.suggestions - The list of suggestions to display.
 * @param {Function} props.handleSuggestionClick - The callback function to handle suggestion click events.
 * @param {string} props.filter - The filter string to match suggestions.
 * @param {Function} props.setIsOpen - The callback function to set the open state of the popover.
 * @param {boolean} props.isOpen - The current open state of the popover.
 * @param {React.RefObject<NonNullable<HTMLInputElement>>} props.ref - The ref for the input element.
 * @returns {JSX.Element} The rendered SuggestionsPopover component.
 */
export const SuggestionsPopover = forwardRef<
  NonNullable<HTMLInputElement>,
  Props
>(({ suggestions, handleSuggestionClick, filter, setIsOpen, isOpen }, ref) => {
  if (!ref) {
    throw new Error(
      "You need to define a ref for the SuggestionsPopover component.",
    );
  }

  const reference = ref as React.RefObject<NonNullable<HTMLInputElement>>;
  const parentCurrent = reference?.current;

  const [autocompleteOptions, setAutocompleteOptions] = React.useState<
    string[]
  >([]);
  const autocompleteRef = React.useRef<HTMLDivElement>(null);

  /**
   * Handles the suggestion click event.
   *
   * @param {React.MouseEvent} event - The click event.
   * @param {string} suggestion - The suggestion value.
   * @returns {void}
   */
  const handleSuggestionClickInternal = (event, suggestion) => {
    event.stopPropagation();
    handleSuggestionClick(suggestion);
    setIsOpen(false);
  };

  /**
   * Handles the click outside event.
   *
   * @param {React.MouseEvent} event - The click event.
   * @returns {void}
   */
  const handleClickOutside = (event) => {
    if (
      isOpen &&
      autocompleteRef &&
      autocompleteRef.current &&
      !autocompleteRef.current.contains(event.target) &&
      !parentCurrent?.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  /**
   * Handles the keyboard events for the autocomplete menu.
   *
   * @param {React.KeyboardEvent} event - The keyboard event.
   */
  const handleMenuKeys = (event) => {
    // If the focus is on the input and the autocomplete menu is open.
    if (
      isOpen &&
      reference.current === event.target &&
      autocompleteRef &&
      autocompleteRef.current
    ) {
      switch (event.key) {
        // the up and down arrow keys navigate the autocomplete menu.
        case "ArrowUp":
        case "ArrowDown":
          const firstElement: HTMLButtonElement | null =
            autocompleteRef.current.querySelector("li > button:not(:disabled)");
          firstElement && firstElement.focus();
          event.preventDefault(); // by default, the up and down arrow keys scroll the window
          break;
        // the escape key will close the menu and return browser focus to the input.
        case "Escape":
          setIsOpen(false);
          reference.current && reference.current.focus();
        // the tab, and enter keys will close the menu, and the tab key will move browser
        // focus forward one element (by default)
        case "Enter":
          event.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
        default:
          break;
      }
      // If the focus is already on the autocomplete menu and the autocomplete menu is open.
      // hitting tab will close the autocomplete and put browser focus back on the search input.
    } else if (
      isOpen &&
      autocompleteRef.current &&
      autocompleteRef.current.contains(event.target) &&
      event.key === "Tab"
    ) {
      event.preventDefault();
      setIsOpen(false);
      reference.current && reference.current.focus();
    }
  };

  const autoCompleteSuggestions = (
    <Menu ref={autocompleteRef}>
      <MenuContent>
        <StyledMenu label="Suggested values" labelHeadingLevel="h3">
          <MenuList>
            {autocompleteOptions.map((suggestion) => (
              <MenuItem
                aria-label={suggestion}
                key={suggestion}
                onClick={(event) =>
                  handleSuggestionClickInternal(event, suggestion)
                }
              >
                {suggestion}
              </MenuItem>
            ))}
          </MenuList>
        </StyledMenu>
      </MenuContent>
    </Menu>
  );

  useEffect(() => {
    const filteredOptions: string[] = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(filter.toLowerCase()),
    );
    setAutocompleteOptions(filteredOptions);
  }, [filter, suggestions]);

  useEffect(() => {
    window.addEventListener("keydown", handleMenuKeys);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleMenuKeys);
      window.removeEventListener("click", handleClickOutside);
    };
  });

  return (
    <Popper
      popper={autoCompleteSuggestions}
      popperRef={autocompleteRef}
      isVisible={isOpen}
      enableFlip={true}
      triggerRef={reference}
    />
  );
});

const StyledMenu = styled(MenuGroup)`
  max-height: 400px;
  overflow-y: auto;
`;
