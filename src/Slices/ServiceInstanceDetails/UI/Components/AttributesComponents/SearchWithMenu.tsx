import React, { useRef, useState, useCallback, useEffect } from "react";
import { SearchInput, Menu, MenuContent, MenuList, MenuItem, Popper } from "@patternfly/react-core";
import styled from "styled-components";

export interface SearchWithMenuProps<T extends string = string> {
  value: T | string;
  onChange: (value: string) => void;
  options: T[];
  ariaLabel?: string;
  placeholder?: string;
  filterStrategy?: "startsWith" | "includes" | "all" | ((option: string, value: string) => boolean);
  maxItems?: number;
  onClear?: () => void;
}

export const TEST_IDS = {
  input: "swd-input",
  menu: "swd-menu",
  menuItem: (option: string) => `swd-item-${option}`,
};

export function SearchWithMenu<T extends string = string>({
  value,
  onChange,
  options,
  ariaLabel = "search-with-menu",
  placeholder = "Search or select…",
  filterStrategy = "startsWith",
  maxItems,
  onClear,
}: SearchWithMenuProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const suppressCloseRef = useRef(false);

  const filter = useCallback(
    (option: string, value: string): boolean => {
      if (!value) return true;
      if (typeof filterStrategy === "function") return filterStrategy(option, value);
      const lower = value.toLowerCase();
      if (filterStrategy === "all") return true;
      if (filterStrategy === "includes") return option.toLowerCase().includes(lower);
      return option.toLowerCase().startsWith(lower);
    },
    [filterStrategy]
  );

  const filtered = options
    .filter((option) => filter(option, value))
    .slice(0, maxItems ?? options.length);

  const handleSearchChange = (
    _event: React.FormEvent | React.MouseEvent | React.ChangeEvent,
    val: string
  ) => {
    onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
    suppressCloseRef.current = true;
    setIsOpen(true);
  };

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (suppressCloseRef.current) {
      suppressCloseRef.current = false;
      return;
    }
    if (
      searchRef.current?.contains(e.target as Node) ||
      menuRef.current?.contains(e.target as Node)
    ) {
      return;
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleDocumentClick);
    } else {
      document.removeEventListener("click", handleDocumentClick);
    }
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isOpen, handleDocumentClick]);

  const menuOpen = isOpen && filtered.length > 0;

  const searchInput = (
    <StyledSearchInput
      ref={searchRef}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={handleSearchChange}
      onClear={handleClear}
      onFocus={() => setIsOpen(true)}
      inputProps={{ "data-testid": TEST_IDS.input }}
    />
  );

  const menu = (
    <Menu isScrollable ref={menuRef} data-testid={TEST_IDS.menu}>
      <MenuContent>
        <MenuList>
          {filtered.map((option) => (
            <MenuItem
              key={option}
              itemId={option}
              isSelected={option === value}
              onClick={() => handleSelect(option)}
              data-testid={TEST_IDS.menuItem(option)}
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <Popper
      trigger={searchInput}
      triggerRef={searchRef}
      popper={menu}
      popperRef={menuRef}
      isVisible={menuOpen}
      enableFlip
    />
  );
}

export const StyledSearchInput = styled(SearchInput)`
  input {
    min-width: inherit;
  }
`;
