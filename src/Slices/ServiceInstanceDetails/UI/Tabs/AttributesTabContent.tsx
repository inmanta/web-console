import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import styled from "styled-components";
import {
  AttributesViewProvider,
  AttributeViewToggles,
} from "../Components/AttributesComponents";
import { TabContentWrapper } from "./TabContentWrapper";

/**
 * The AttributesTabContent Component
 *
 * This component is responsible to display which view is displayed within the tab.
 * The ToggleOptions allow the user to change between the Table, the Editor, and the Compare views.
 *
 * @returns {React.FC} The AttributesTabContent
 */
export const AttributesTabContent: React.FC = () => {
  const [selectedView, setSelectedView] = useState(AttributeViewToggles.TABLE);

  const handleToggleClick = (event, _isSelected: boolean) => {
    const id = event.currentTarget.id;

    setSelectedView(id);
  };

  return (
    <TabContentWrapper id={"Attribute-content"}>
      <StyledToggleGroup aria-label="toggle-group-attributes" isCompact>
        <ToggleGroupItem
          text={AttributeViewToggles.TABLE}
          buttonId={AttributeViewToggles.TABLE}
          isSelected={selectedView === AttributeViewToggles.TABLE}
          onChange={handleToggleClick}
          isDisabled={false}
        />
        <ToggleGroupItem
          text={AttributeViewToggles.EDITOR}
          buttonId={AttributeViewToggles.EDITOR}
          isSelected={selectedView === AttributeViewToggles.EDITOR}
          onChange={handleToggleClick}
          isDisabled={false}
        />
        <ToggleGroupItem
          text={AttributeViewToggles.COMPARE}
          buttonId={AttributeViewToggles.COMPARE}
          isSelected={selectedView === AttributeViewToggles.COMPARE}
          onChange={handleToggleClick}
          isDisabled={false}
        />
      </StyledToggleGroup>
      <AttributesViewProvider selectedView={selectedView} />
    </TabContentWrapper>
  );
};

const StyledToggleGroup = styled(ToggleGroup)`
  justify-content: center;
  margin-top: var(--pf-v5-global--spacer--md);
`;
