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
import { uniq } from "lodash-es";
import { toggleValueInList } from "@/Core";

interface Props {
  versions: string[];
  isVisible: boolean;
  update: (versions: string[]) => void;
}

export const VersionFilter: React.FC<Props> = ({
  versions,
  isVisible,
  update,
}) => {
  const [idInput, setIdInput] = useState("");

  const onIdInput = (event) => {
    if ((event.key && event.key !== "Enter") || idInput === "") return;
    update(uniq(toggleValueInList(idInput, versions)));
    setIdInput("");
  };
  const removeChip = (cat, id) => {
    update(versions.filter((value) => value !== id));
  };

  return (
    <ToolbarFilter
      chips={versions}
      deleteChip={removeChip}
      categoryName="Version"
      showToolbarItem={isVisible}
    >
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            data-testid="VersionFilterInput"
            name="versionInput"
            type="number"
            aria-label="VersionFilter"
            onChange={(_event, val) => setIdInput(val)}
            value={idInput}
            placeholder="Filter by version..."
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
