import React, { ReactText, useState } from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";

type TabKey = "Attributes" | "Status";

export interface TabProps {
  title: string;
  icon: React.ReactElement;
}

interface TabViewProps {
  children: React.ReactElement<TabProps>[];
}

export const ServiceInstanceDetails: React.FC<TabViewProps> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Status");

  const setActiveTabWithEventKey = (event, eventKey: ReactText) =>
    setActiveTab(eventKey as TabKey);

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={setActiveTabWithEventKey}
      mountOnEnter
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
