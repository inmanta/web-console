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
  id?: string;
  isVisible: boolean;
  update: (id?: string) => void;
}

export const IdFilter: React.FC<Props> = ({ id, isVisible, update }) => {
  const [idInput, setIdInput] = useState("");

  const removeChip = () => update();

  const onIdInput = (event) => {
    if (event.key && event.key !== "Enter") return;
    update(idInput);
    setIdInput("");
  };

  const chips = id ? [id] : [];

  return (
    <ToolbarFilter
      chips={chips}
      deleteChip={removeChip}
      categoryName="Id"
      showToolbarItem={isVisible}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            data-testid="IdFilterInput"
            name="idInput"
            id="idInput1"
            type="search"
            aria-label="IdFilter"
            onChange={(_event, val) => setIdInput(val)}
            value={idInput}
            placeholder="Filter by id..."
            onKeyDown={onIdInput}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant={ButtonVariant.control}
            aria-label="search button for search input"
            onClick={onIdInput}
          >
            <SearchIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </ToolbarFilter>
  );
};
