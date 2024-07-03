import React from "react";
import { Tab, TabContent, TabTitleText } from "@patternfly/react-core";
import { words } from "@/UI";

export const DocumentationTab: React.FC = () => {
  return (
    <Tab
      eventKey={"0"}
      title={
        <TabTitleText>
          {words("instanceDetails.tabs.documentation")}
        </TabTitleText>
      }
      aria-label="documentation-content"
    >
      <TabContent role="tabpanel" id={"Documentation-content"}>
        Temporary Documentation Content
      </TabContent>
    </Tab>
  );
};
