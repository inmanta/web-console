import React, { useState } from "react";
import {
  Button,
  ToolbarFilter,
  InputGroup,
  TextInput,
  ButtonVariant,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";

interface Props {
  identity: {
    value?: string;
    pretty: string;
  };
  isVisible: boolean;
  update: (value?: string) => void;
}

export const IdentityFilter: React.FC<Props> = ({
  identity,
  isVisible,
  update,
}) => {
  const [input, setInput] = useState("");

  const removeChip = () => update();

  const onInput = (event) => {
    if (event.key && event.key !== "Enter") return;
    setInput("");
    update(input);
  };

  const chips = identity.value ? [identity.value] : [];

  return (
    <ToolbarFilter
      chips={chips}
      deleteChip={removeChip}
      categoryName={identity.pretty}
      showToolbarItem={isVisible}
    >
      <InputGroup>
        <TextInput
          name="identityInput"
          id="identityInput"
          type="search"
          aria-label="IdentityFilter"
          onChange={setInput}
          value={input}
          placeholder={`Filter by ${identity.pretty}...`}
          onKeyDown={onInput}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={onInput}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );
};
