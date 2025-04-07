import React from "react";
import {
  Button,
  ToolbarFilter,
  TextInput,
  ButtonVariant,
  ToolbarLabel,
  ToolbarLabelGroup,
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
    category: string | ToolbarLabelGroup,
    chip: string | ToolbarLabel,
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
      labels={searchEntries ? searchEntries : []}
      deleteLabel={removeChip}
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
