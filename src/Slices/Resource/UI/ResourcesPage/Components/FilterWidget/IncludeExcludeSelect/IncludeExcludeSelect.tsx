import React, { ReactElement, useState } from "react";
import { MenuToggle, MenuToggleElement, Select } from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, Tbody } from "@patternfly/react-table";
import { invertFilter } from "../utils";
import { IncludeExcludeOption } from "./IncludeExcludeOption";

export interface IncludeExcludeSelectProps {
  label: string;
  placeholder: string;
  selected: string[];
  options: string[];
  onOptionClick: (value: string) => void;
}

/**
 * The IncludeExcludeSelect component.
 *
 * A dropdown select that renders each option as a row with include/exclude toggle actions.
 * Manages its own open/close state internally.
 *
 * @Props {IncludeExcludeSelectProps} - Component props.
 *  @prop {string} label - Accessible aria-label for the select element.
 *  @prop {string} placeholder - Text shown in the menu toggle button.
 *  @prop {string[]} selected - Currently selected values (both included and excluded).
 *  @prop {string[]} options - Full list of values to render as rows.
 *  @prop {(value: string) => void} onOptionClick - Callback executed when an include or exclude action is triggered.
 * @returns {ReactElement} The rendered include/exclude select dropdown.
 */
export const IncludeExcludeSelect = ({
  label,
  placeholder,
  selected,
  options,
  onOptionClick,
}: IncludeExcludeSelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label={`${label}-toggle`}
          onClick={() => setIsOpen((prev) => !prev)}
          isExpanded={isOpen}
          icon={<SearchIcon />}
          isFullWidth
        >
          {placeholder}
        </MenuToggle>
      )}
      aria-label={label}
      selected={selected}
      isOpen={isOpen}
      onOpenChange={(openState: boolean) => setIsOpen(openState)}
    >
      {isOpen ? (
        <Table variant="compact">
          <Tbody>
            {options.map((option) => (
              <IncludeExcludeOption
                key={option}
                state={option}
                includeActive={selected.includes(option)}
                excludeActive={selected.includes(invertFilter(option))}
                onInclude={() => onOptionClick(option)}
                onExclude={() => onOptionClick(invertFilter(option))}
              />
            ))}
          </Tbody>
        </Table>
      ) : null}
    </Select>
  );
};
