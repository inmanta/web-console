import React, { useEffect, useId, useRef, useState } from "react";
import {
  Button,
  FormGroup,
  InputGroup,
  InputGroupItem,
  SearchInput,
  Popper,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  Spinner,
  Flex,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { useClickOutside, words } from "@/UI";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AddableSelectInputProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  onAdd: (value: string) => void;
  onFilter: (value: string) => void;
  onReachEnd: () => void;
  onToggleInputMode: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading: boolean;
}

/**
 * The AddableSelectInput component.
 *
 * Provides a typeahead select input paired with a control button to append values to a filter category.
 * Clicking the input opens the full options list; typing filters it via the onFilter callback.
 *
 * @Props {AddableSelectInputProps} - Component props.
 *  @prop {string} label - Label shown above the select field.
 *  @prop {string} [placeholder] - Optional placeholder option shown when no value is selected.
 *  @prop {SelectOption[]} options - The list of selectable options.
 *  @prop {(value: string) => void} onAdd - Callback executed with the selected value when the add action is triggered.
 *  @prop {(value: string) => void} onFilter - Callback executed when the search input value changes.
 *  @prop {() => void} onReachEnd - Callback executed whenever the menu scroll almost reaches the end.
 *  @prop {(event) => React.MouseEvent<HTMLButtonElement>} onToggleInputMode
 *  - Callback executed whenever we press on the labelInfo of the FormGroup
 *  @prop {boolean} isLoading - Boolean to indicate whether the options are loaded or loading more.
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
  isLoading,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [inputWidth, setInputWidth] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const selectId = useId();
  const inputGroupRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([inputGroupRef, menuRef], () => setIsOpen(false), isOpen);

  // Need this mainly for a niche visual bug when menu is open and we start resizing
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;

    const el = inputGroupRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setInputWidth(entry.contentRect.width);
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  const handleFilter = (next: string) => {
    setFilterValue(next);
    onFilter(next);
    setIsOpen(true);
  };

  const handleSelect = (value: string) => {
    setFilterValue(value);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleAdd = () => {
    if (!filterValue.trim()) return;
    onAdd(filterValue.trim());
    setFilterValue("");
    onFilter("");
    setIsOpen(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

    if (isBottom) {
      onReachEnd();
    }
  };

  const menuContent = (
    <div
      ref={menuRef}
      onScroll={handleScroll}
      style={{
        // We do this because we want this to match the width of the inputs.
        width: inputWidth ? `${inputWidth}px` : "auto",
        maxHeight: "250px",
        overflowY: "auto",
        marginTop: "4px",
        border: "1px solid var(--pf-t--global--border--color--default)",
        borderRadius: "var(--pf-t--global--border--radius--small)",
        boxShadow: "var(--pf-t--global--box-shadow--sm)",
        backgroundColor: "var(--pf-t--global--background--color--floating--default)",
        // Keep mounted, just hide — prevents flash on re-render
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <Menu onSelect={(_, value) => handleSelect(String(value))}>
        <MenuContent>
          <MenuList>
            {options.map((option, index) => (
              <MenuItem
                key={option.value}
                itemId={option.value}
                isFocused={index === highlightIndex}
                style={{
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {option.label}
              </MenuItem>
            ))}

            {isLoading && (
              <MenuItem isDisabled>
                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                  {words("resources.filters.resource.agent.loading")}
                  <Spinner size="sm" />
                </Flex>
              </MenuItem>
            )}

            {options.length === 0 && !isLoading && (
              <MenuItem isDisabled>{words("agents.empty.message")}</MenuItem>
            )}
          </MenuList>
        </MenuContent>
      </Menu>
    </div>
  );

  return (
    <FormGroup
      label={
        <span style={{ fontWeight: "var(--pf-t--global--font--weight--body--bold)" }}>{label}</span>
      }
      fieldId={selectId}
      labelInfo={
        <Button variant="link" isInline onClick={onToggleInputMode}>
          {words("resources.filters.resource.agent.selectInfoLabel")}
        </Button>
      }
    >
      <InputGroup ref={inputGroupRef}>
        <InputGroupItem isFill>
          <Popper
            trigger={
              <SearchInput
                id={selectId}
                placeholder={placeholder}
                value={filterValue}
                onChange={(_, next) => handleFilter(next)}
                onFocus={() => setIsOpen(true)}
                onClear={() => {
                  setFilterValue("");
                  onFilter("");
                  setIsOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                    return;
                  }

                  if (!isOpen && event.key === "ArrowDown") {
                    setIsOpen(true);
                    setHighlightIndex(0);
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
                    return;
                  }

                  if (event.key === "ArrowUp") {
                    setHighlightIndex((prev) => Math.max(prev - 1, 0));
                    return;
                  }

                  if (event.key === "Enter") {
                    if (highlightIndex >= 0 && options[highlightIndex]) {
                      const selected = options[highlightIndex];
                      handleSelect(selected.value);
                      return;
                    }

                    handleAdd();
                  }
                }}
                data-testid="search-input"
                appendTo={document.body}
                resetButtonLabel="clear-button"
              />
            }
            popper={menuContent}
            isVisible={true}
            enableFlip
            flipBehavior={["bottom", "top"]}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            onClick={handleAdd}
            isDisabled={!filterValue}
            data-testid="add-button"
            aria-label={words("resources.filters.filter")}
          >
            <PlusIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};
