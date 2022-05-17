import React from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import QueryString from "qs";
import { useUrlStateWithString } from "@/Data";
import { RessourceRow } from "./ComposableTableExpandable";
import { ResourceDetailsTab } from "./resourceDetailsTab";

interface ResourceTabsProps {
  resource: RessourceRow;
}

export const ResourceTabs: React.FunctionComponent<ResourceTabsProps> = ({
  resource,
}) => {
  const [activeTabKey, setActiveTabKey] = useUrlStateWithString({
    default: "details",
    key: `tab-${QueryString.stringify(resource.id)}`,
    route: "ResourcesV2",
  });

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
        <ResourceDetailsTab resourceId={resource.id} />
      </Tab>
      <Tab eventKey="tab2" title="Second tab">
        world
      </Tab>
    </Tabs>
  );
};
