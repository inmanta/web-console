import React, { ReactText } from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

export interface TabDescriptor {
  id: string;
  title: string;
  icon: React.ReactElement;
  view: React.ReactElement;
}

interface Props {
  tabs: TabDescriptor[];
  activeTab: string;
  onChange: (tabKey: string) => void;
}

/**
 * A tabs component with icons in the title
 */
export const IconTabs: React.FC<Props> = ({ activeTab, onChange, tabs }) => {
  const setActiveTabWithEventKey = (event, eventKey: ReactText) =>
    onChange(eventKey as typeof activeTab);

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={setActiveTabWithEventKey}
      mountOnEnter
      unmountOnExit
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          eventKey={tab.id}
          title={
            <>
              <TabTitleIcon>{tab.icon}</TabTitleIcon>
              <TabTitleText>{tab.title}</TabTitleText>
            </>
          }
        >
          {tab.view}
        </Tab>
      ))}
    </Tabs>
  );
};
