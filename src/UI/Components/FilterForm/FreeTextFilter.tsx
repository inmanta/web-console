import React from "react";
import {
  Button,
  ToolbarFilter,
  InputGroup,
  TextInput,
  ButtonVariant,
  ToolbarChip,
  ToolbarChipGroup,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";

interface Props {
  isHidden?: boolean;
  filterPropertyName: string;
  placeholder: string;
  searchEntries?: string[];
  removeChip: (
    category: string | ToolbarChipGroup,
    chip: string | ToolbarChip
  ) => void;
  value: string;
  setValue: (value: string) => void;
}

export const FreeTextFilter: React.FC<Props> = ({
  filterPropertyName,
  placeholder,
  searchEntries,
  isHidden,
  removeChip,
  value,
  setValue,
}) => {
  return (
    <ToolbarFilter
      chips={searchEntries ? searchEntries : []}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={!isHidden}
    >
      <InputGroup>
        <TextInput
          data-testid={`${filterPropertyName}FilterInput`}
          name={`${filterPropertyName}FilterInput`}
          type="search"
          aria-label={`${filterPropertyName}Filter`}
          onChange={setValue}
          value={value}
          placeholder={placeholder}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="submit search"
          type="submit"
          value={filterPropertyName}
          name={filterPropertyName}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );
};
