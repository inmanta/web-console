import React from "react";
import {
  Button,
  ToolbarFilter,
  InputGroup,
  TextInput,
  ButtonVariant,
  InputGroupItem,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";

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

  const onSelect = () => {
    update(searchEntry);
  };

  return (
    <ToolbarFilter
      chips={searchEntry ? [searchEntry] : []}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={isVisible}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            data-testid={`${filterPropertyName}FilterInput`}
            name={`${filterPropertyName}FilterInput`}
            type="search"
            aria-label={`${filterPropertyName}Filter`}
            onChange={(_event, value) => update(value)}
            value={searchEntry}
            placeholder={placeholder}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant={ButtonVariant.control}
            aria-label="submit search"
            onClick={onSelect}
          >
            <SearchIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </ToolbarFilter>
  );
};
