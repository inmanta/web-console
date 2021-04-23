import React, { ReactText } from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

export interface TabDescriptor<K extends string> {
  id: K;
  title: string;
  icon: React.ReactNode;
  view: React.ReactNode;
}

interface Props<K extends string> {
  tabs: TabDescriptor<K>[];
  activeTab: K;
  onChange: (tabKey: K) => void;
}

/**
 * A tabs component with icons in the title
 */
export const IconTabs = <Key extends string>({
  activeTab,
  onChange,
  tabs,
}: Props<Key>): ReturnType<React.FC<Props<Key>>> => {
  const setActiveTabWithEventKey = (event, eventKey: ReactText) =>
    onChange(eventKey as Key);

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
