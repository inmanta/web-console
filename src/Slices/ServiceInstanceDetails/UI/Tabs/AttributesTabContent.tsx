import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import styled from "styled-components";
import {
  AttributesCompare,
  AttributesEditor,
  AttributesTable,
} from "../Components/AttributesComponents";
import { TabContentWrapper } from "./TabContentWrapper";

enum ToggleKeys {
  TABLE = "Table",
  COMPARE = "Compare",
  EDITOR = "JSON-Editor",
}

export const AttributesTabContent: React.FC = () => {
  // Dropdown to select set
  // code editor / table / compare => the compare needs access to the history logs.
  // add expert mode

  const [isSelected, setIsSelected] = useState(ToggleKeys.TABLE);

  const handleToggleClick = (event, _isSelected: boolean) => {
    const id = event.currentTarget.id;

    setIsSelected(id);
  };

  return (
    <TabContentWrapper role="tabpanel" id={"Attribute-content"}>
      <StyledToggleGroup aria-label="toggle-group-attributes" isCompact>
        <ToggleGroupItem
          text={ToggleKeys.TABLE}
          buttonId={ToggleKeys.TABLE}
          isSelected={isSelected === ToggleKeys.TABLE}
          onChange={handleToggleClick}
          isDisabled={false}
        />
        <ToggleGroupItem
          text={ToggleKeys.EDITOR}
          buttonId={ToggleKeys.EDITOR}
          isSelected={isSelected === ToggleKeys.EDITOR}
          onChange={handleToggleClick}
          isDisabled={false}
        />
        <ToggleGroupItem
          text={ToggleKeys.COMPARE}
          buttonId={ToggleKeys.COMPARE}
          isSelected={isSelected === ToggleKeys.COMPARE}
          onChange={handleToggleClick}
          isDisabled={false}
        />
      </StyledToggleGroup>
      {isSelected === ToggleKeys.TABLE && <AttributesTable />}
      {isSelected === ToggleKeys.EDITOR && <AttributesEditor />}
      {isSelected === ToggleKeys.COMPARE && <AttributesCompare />}
    </TabContentWrapper>
  );
};

const StyledToggleGroup = styled(ToggleGroup)`
  justify-content: center;
  margin-top: var(--pf-v5-global--spacer--md);
`;
