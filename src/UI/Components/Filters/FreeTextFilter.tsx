import React, { useState } from "react";
import {
  ToolbarFilter,
  InputGroup,
  InputGroupItem,
  SearchInput,
} from "@patternfly/react-core";

interface Props {
  isHidden?: boolean;
  filterPropertyName: string;
  placeholder: string;
  searchEntries?: string[];
  update: (searchEntries: string[]) => void;
}

export const FreeTextFilter: React.FC<Props> = ({
  filterPropertyName,
  placeholder,
  searchEntries,
  isHidden,
  update,
}) => {
  const [textInput, setTextInput] = useState("");

  const removeChip = (cat, id) =>
    update(searchEntries ? searchEntries.filter((value) => value !== id) : []);

  const onTextInput = (event) => {
    if (event.key && event.key !== "Enter") return;
    if (textInput.length <= 0) return;
    update(searchEntries ? [...searchEntries, textInput] : [textInput]);
    setTextInput("");
  };

  return (
    <ToolbarFilter
      labels={searchEntries ? searchEntries : []}
      deleteLabel={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={!isHidden}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <SearchInput
            data-testid={`${filterPropertyName}FilterInput`}
            name={`${filterPropertyName}FilterInput`}
            type="search"
            aria-label={`${filterPropertyName}Filter`}
            onChange={(_event, val) => setTextInput(val)}
            value={textInput}
            placeholder={placeholder}
            onKeyDown={onTextInput}
          />
        </InputGroupItem>
      </InputGroup>
    </ToolbarFilter>
  );
};
