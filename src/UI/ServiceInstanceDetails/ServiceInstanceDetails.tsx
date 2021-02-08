import React, { ReactText } from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

type TabKey = "Attributes" | "Status";

export interface TabProps {
  title: string;
  icon: React.ReactElement;
}

interface TabViewProps {
  activeTab: TabKey;
  setActiveTab: React.Dispatch<React.SetStateAction<TabKey>>;
  children: React.ReactElement<TabProps>[];
}

export const ServiceInstanceDetails: React.FC<TabViewProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const setActiveTabWithEventKey = (event, eventKey: ReactText) =>
    setActiveTab(eventKey as TabKey);

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={setActiveTabWithEventKey}
      mountOnEnter
      unmountOnExit
    >
      {React.Children.map(children, (child) => (
        <Tab
          eventKey={child.props.title}
          title={
            <>
              <TabTitleIcon>{child.props.icon}</TabTitleIcon>
              <TabTitleText>{child.props.title}</TabTitleText>
            </>
          }
        >
          {child}
        </Tab>
      ))}
    </Tabs>
  );
};
