import React, { ReactText, useState } from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";
import { ListIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

type TabKey = "Attributes";

export const InstanceDetails: React.FC = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Attributes");

  const setActiveTabWithEventKey = (event, eventKey: ReactText) =>
    setActiveTab(eventKey as TabKey);

  return (
    <Tabs activeKey={activeTab} onSelect={setActiveTabWithEventKey}>
      <Tab
        eventKey="Attributes"
        title={
          <>
            <TabTitleIcon>
              <ListIcon />
            </TabTitleIcon>
            <TabTitleText>{words("inventory.tabs.attributes")}</TabTitleText>
          </>
        }
      >
        {children}
      </Tab>
    </Tabs>
  );
};
