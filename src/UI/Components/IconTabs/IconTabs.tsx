import React from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

export interface TabDescriptor<K extends string> {
  id: K;
  title: string;
  icon: React.ReactNode;
  view: React.ReactNode;
  isDisabled?: boolean;
  ref?: React.MutableRefObject<HTMLElement | undefined>;
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
  const setActiveTabWithEventKey = (_event, eventKey: number | string) =>
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
          ref={tab.ref}
          isAriaDisabled={tab.isDisabled}
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
