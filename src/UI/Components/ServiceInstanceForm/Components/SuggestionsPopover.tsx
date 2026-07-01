import React, { useEffect, forwardRef } from "react";
import { Menu, MenuContent, MenuGroup, MenuItem, MenuList, Popper } from "@patternfly/react-core";
import styled from "styled-components";
import { SuggestionValue } from "@/Core";

interface Props {
  suggestions: SuggestionValue[];
  filter: string;
  handleSuggestionClick: (value: string) => void;
  isOpen: boolean;
  close: () => void;
}

/**
 * Renders a popover component that displays suggestions based on user input in the referenced field.
 *
 * @component
 * @example
 * // Usage
 * <SuggestionsPopover
 *   suggestions={[{ label: "apple", value: "apple" }, { label: "10 Gbps", value: "10000" }]}
 *   handleSuggestionClick={(value) => console.log(value)}
 *   filter="a"
 *   close={close}
 *   isOpen={isOpen}
 *   ref={inputRef}
 * />
 *
 * @param {Object} props - The component props.
 * @param {SuggestionValue[]} props.suggestions - The list of suggestions to display. Each carries a `label` (shown + searched) and a `value` (submitted).
 * @param {Function} props.handleSuggestionClick - The callback invoked with the selected suggestion's `value`.
 * @param {string} props.filter - The filter string matched against each suggestion's `label`.
 * @param {Function} props.close - Callback to close the popover (selection, click-outside, keyboard dismiss).
 * @param {boolean} props.isOpen - The current open state of the popover.
 * @param {React.RefObject<NonNullable<HTMLInputElement>>} props.ref - The ref for the input element.
 * @returns {React.FC} The rendered SuggestionsPopover component.
 */
export const SuggestionsPopover = forwardRef<NonNullable<HTMLInputElement>, Props>(
  ({ suggestions, handleSuggestionClick, filter, close, isOpen }, ref) => {
    if (!ref) {
      throw new Error("You need to define a ref for the SuggestionsPopover component.");
    }

    const reference = ref as React.RefObject<NonNullable<HTMLInputElement>>;
    const parentCurrent = reference?.current;

    const autocompleteRef = React.useRef<HTMLDivElement>(null);

    const autocompleteOptions = suggestions.filter((suggestion) =>
      suggestion.label.toLowerCase().includes(filter.toLowerCase())
    );

    /**
     * Handles the suggestion click event.
     *
     * @param {React.MouseEvent} event - The click event.
     * @param {SuggestionValue} suggestion - The clicked suggestion.
     * @returns {void}
     */
    const handleSuggestionClickInternal = (
      event: React.MouseEvent,
      suggestion: SuggestionValue
    ) => {
      event.stopPropagation();
      handleSuggestionClick(suggestion.value);
      close();
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
        close();
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
            const firstElement: HTMLButtonElement | null = autocompleteRef.current.querySelector(
              "li > button:not(:disabled)"
            );

            firstElement && firstElement.focus();
            event.preventDefault(); // by default, the up and down arrow keys scroll the window
            break;
          // the escape key will close the menu and return browser focus to the input.
          case "Escape":
            close();
            reference.current && reference.current.focus();
            // the tab, and enter keys will close the menu, and the tab key will move browser
            // focus forward one element (by default)
            break;
          case "Enter":
            event.preventDefault();
            close();
            break;
          case "Tab":
            close();
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
        close();
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
                  aria-label={suggestion.label}
                  key={`${suggestion.label}::${suggestion.value}`}
                  onClick={(event) => handleSuggestionClickInternal(event, suggestion)}
                >
                  {suggestion.label}
                </MenuItem>
              ))}
            </MenuList>
          </StyledMenu>
        </MenuContent>
      </Menu>
    );

    useEffect(() => {
      window.addEventListener("keydown", handleMenuKeys);
      window.addEventListener("click", handleClickOutside);

      return () => {
        window.removeEventListener("keydown", handleMenuKeys);
        window.removeEventListener("click", handleClickOutside);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
      <Popper
        popper={autoCompleteSuggestions}
        popperRef={autocompleteRef}
        isVisible={isOpen}
        enableFlip={true}
        triggerRef={reference}
      />
    );
  }
);

const StyledMenu = styled(MenuGroup)`
  max-height: 400px;
  overflow-y: auto;
`;
