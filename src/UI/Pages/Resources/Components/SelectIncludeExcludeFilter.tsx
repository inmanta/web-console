import React, { useState } from "react";
import { ToolbarFilter, Select } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  CheckIcon,
  SearchIcon,
  TimesCircleIcon,
  TimesIcon,
} from "@patternfly/react-icons";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { uniq } from "lodash-es";
import styled from "styled-components";
import { toggleValueInList } from "@/Core";

interface Props {
  filterPropertyName: string;
  placeholder: string;
  isVisible: boolean;
  selectedStates: string[];
  possibleStates: string[];
  update: (state: string[]) => void;
}

/** Selects one option from a list to be used as a filter */
export const SelectIncludeExcludeFilter: React.FC<Props> = ({
  isVisible,
  selectedStates,
  possibleStates,
  update,
  filterPropertyName,
  placeholder,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onClick = (selection) => {
    const safeSelectedStates = ensureInvertedFilterIsNotPresent(
      selection,
      selectedStates
    );
    const updatedSelection = uniq(
      toggleValueInList(selection, safeSelectedStates)
    );
    update(updatedSelection);
    setIsFilterOpen(false);
  };

  const removeChip = (cat, id) => {
    update(selectedStates.filter((value) => value !== id));
  };

  return (
    <ToolbarFilter
      chips={selectedStates}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={isVisible}
    >
      <Select
        aria-label={filterPropertyName}
        onToggle={setIsFilterOpen}
        selections={selectedStates}
        isOpen={isFilterOpen}
        placeholderText={placeholder}
        toggleIcon={<SearchIcon />}
        toggleAriaLabel={`${filterPropertyName}-toggle`}
        chipGroupProps={{ numChips: 0 }}
        customContent={
          <TableComposable variant="compact">
            <Tbody>
              {possibleStates.map((state) => (
                <IncludeExcludeOption
                  key={state}
                  state={state}
                  includeActive={selectedStates.includes(state)}
                  excludeActive={selectedStates.includes(invertFilter(state))}
                  onInclude={() => onClick(state)}
                  onExclude={() => onClick(invertFilter(state))}
                />
              ))}
            </Tbody>
          </TableComposable>
        }
      />
    </ToolbarFilter>
  );
};

interface RowProps {
  state: string;
  includeActive: boolean;
  excludeActive: boolean;
  onInclude: () => void;
  onExclude: () => void;
}

const IncludeExcludeOption: React.FC<RowProps> = ({
  state,
  includeActive,
  excludeActive,
  onInclude,
  onExclude,
}) => (
  <UnborderedRow key={state}>
    <UnpaddedCell>
      <MenuNameItem>{state}</MenuNameItem>
    </UnpaddedCell>
    <UnpaddedCell>
      <span className="pf-c-select__menu-wrapper">
        <ClickableMenuItem
          className="pf-c-select__menu-item"
          onClick={onInclude}
          aria-label={`${state}-include-toggle`}
        >
          <span
            aria-label={
              includeActive
                ? `${state}-include-active`
                : `${state}-include-inactive`
            }
          >
            {includeActive ? <ActiveIncludeIcon /> : <InactiveIncludeIcon />}
          </span>
        </ClickableMenuItem>
      </span>
    </UnpaddedCell>
    <UnpaddedCell>
      <div className="pf-c-select__menu-wrapper">
        <ClickableMenuItem
          className="pf-c-select__menu-item"
          onClick={onExclude}
          aria-label={`${state}-exclude-toggle`}
        >
          <span
            aria-label={
              excludeActive
                ? `${state}-exclude-active`
                : `${state}-exclude-inactive`
            }
          >
            {excludeActive ? <ActiveExcludeIcon /> : <InactiveExcludeIcon />}
          </span>
        </ClickableMenuItem>
      </div>
    </UnpaddedCell>
  </UnborderedRow>
);

const ensureInvertedFilterIsNotPresent = (
  selection: string,
  selectedStates: string[]
): string[] => {
  const invertedFilter = invertFilter(selection);
  if (selectedStates.includes(invertedFilter)) {
    return toggleValueInList(invertedFilter, selectedStates);
  }
  return selectedStates;
};

const invertFilter = (selection: string) => {
  if (selection.startsWith("!")) {
    return selection.slice(1);
  } else {
    return `!${selection}`;
  }
};

const UnborderedRow = styled(Tr)`
  &&& {
    border-bottom: 0;
  }
`;

const UnpaddedCell = styled(Td)`
  && {
    padding: 0;
  }
`;

const ActiveIncludeIcon = styled(CheckIcon)`
  color: var(--pf-global--active-color--100);
`;
const InactiveIncludeIcon = styled(CheckCircleIcon)`
  color: var(--pf-global--disabled-color--200);
`;

const ActiveExcludeIcon = styled(TimesIcon)`
  color: var(--pf-global--danger-color--100);
`;

const InactiveExcludeIcon = styled(TimesCircleIcon)`
  color: var(--pf-global--disabled-color--200);
`;

const ClickableMenuItem = styled.span`
  cursor: pointer;
`;

const MenuNameItem = styled.span`
  position: relative;
  width: var(--pf-c-select__menu-item--Width);
  padding: var(--pf-c-select__menu-item--PaddingTop)
    var(--pf-c-select__menu-item--PaddingRight)
    var(--pf-c-select__menu-item--PaddingBottom)
    var(--pf-c-select__menu-item--PaddingLeft);
  font-size: var(--pf-c-select__menu-item--FontSize);
  font-weight: var(--pf-c-select__menu-item--FontWeight);
  line-height: var(--pf-c-select__menu-item--LineHeight);
  color: var(--pf-c-select__menu-item--Color);
  text-align: left;
  white-space: nowrap;
  background-color: transparent;
  border: none;
`;
