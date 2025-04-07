import React from "react";
import {
  ToolbarFilter,
  InputGroup,
  InputGroupItem,
  SearchInput,
} from "@patternfly/react-core";

interface Props {
  isVisible: boolean;
  filterPropertyName: string;
  placeholder: string;
  searchEntry?: string;
  update: (searchEntry?: string) => void;
}

export const SimpleFreeTextFilter: React.FC<Props> = ({
  filterPropertyName,
  placeholder,
  searchEntry,
  isVisible,
  update,
}) => {
  const removeChip = () => update(undefined);

  return (
    <ToolbarFilter
      labels={searchEntry ? [searchEntry] : []}
      deleteLabel={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={isVisible}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <SearchInput
            data-testid={`${filterPropertyName}FilterInput`}
            name={`${filterPropertyName}FilterInput`}
            type="search"
            aria-label={`${filterPropertyName}Filter`}
            onChange={(_event, value) => update(value)}
            value={searchEntry}
            placeholder={placeholder}
          />
        </InputGroupItem>
      </InputGroup>
    </ToolbarFilter>
  );
};
