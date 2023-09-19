import React, { useState } from "react";
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
      chips={searchEntries ? searchEntries : []}
      deleteChip={removeChip}
      categoryName={filterPropertyName}
      showToolbarItem={!isHidden}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
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
        <InputGroupItem>
          <Button
            variant={ButtonVariant.control}
            aria-label="submit search"
            onClick={onTextInput}
          >
            <SearchIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </ToolbarFilter>
  );
};
