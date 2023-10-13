import React from "react";
import {
  Button,
  ToolbarFilter,
  TextInput,
  ButtonVariant,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarItem,
  ToolbarGroup,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  isHidden?: boolean;
  filterPropertyName: string;
  placeholder: string;
  searchEntries?: string[];
  removeChip: (
    category: string | ToolbarChipGroup,
    chip: string | ToolbarChip,
  ) => void;
  value: string;
  setValue: (value: string) => void;
  isSubmitVisible?: boolean;
}

export const FreeTextFilter: React.FC<Props> = ({
  filterPropertyName,
  placeholder,
  searchEntries,
  isHidden,
  removeChip,
  value,
  setValue,
  isSubmitVisible = false,
}) => {
  return (
    <ToolbarFilter
      chips={searchEntries ? searchEntries : []}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={!isHidden}
    >
      <ToolbarGroup>
        <ToolbarItem>
          <TextInput
            data-testid={`${filterPropertyName}FilterInput`}
            name={`${filterPropertyName}FilterInput`}
            type="search"
            aria-label={`${filterPropertyName}Filter`}
            onChange={(_event, value) => setValue(value)}
            value={value}
            placeholder={placeholder}
          />
        </ToolbarItem>
        {isSubmitVisible && (
          <ToolbarItem>
            <Button
              variant={ButtonVariant.secondary}
              aria-label="submit search"
              type="submit"
              value={filterPropertyName}
              name={filterPropertyName}
            >
              {words("resources.filters.filter")}
            </Button>
          </ToolbarItem>
        )}
      </ToolbarGroup>
    </ToolbarFilter>
  );
};
