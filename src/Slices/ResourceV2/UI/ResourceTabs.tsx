import React from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { RessourceRow } from "./ComposableTableExpandable";

interface ResourceTabsProps {
  resource: RessourceRow;
}

export const ResourceTabs: React.FunctionComponent<ResourceTabsProps> = ({
  resource,
}) => {
  const [activeTabKey, setActiveTabKey] = useUrlStateWithString({
    default: "tab1",
    key: `tab-${resource.id}`,
    route: "ResourcesV2",
  });

  console.log(activeTabKey);
  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Tabs
      title=""
      activeKey={activeTabKey}
      onSelect={handleTabClick}
      isFilled
      mountOnEnter
    >
      <Tab eventKey="details" title="Details">
        hello
      </Tab>
      <Tab eventKey="tab2" title="Second tab">
        world
      </Tab>
    </Tabs>
  );
};
