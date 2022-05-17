import React from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import QueryString from "qs";
import { useUrlStateWithString } from "@/Data";
import { ResourceRow } from "./ResourceRow";
import { ResourceDetailsTab } from "./resourceDetailsTab";

interface ResourceTabsProps {
  resource: ResourceRow;
  isExpanded: boolean;
}

export const ResourceTabs: React.FunctionComponent<ResourceTabsProps> = ({
  resource,
  isExpanded,
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
    <React.Fragment>
      {isExpanded ? (
        <Tabs
          title=""
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          isFilled
          mountOnEnter
          unmountOnExit
          aria-label="ResourceDetailsTabs"
        >
          <Tab eventKey="details" title="Details">
            <ResourceDetailsTab resourceId={resource.id} />
          </Tab>
          <Tab eventKey="tab2" title="Second tab">
            world
          </Tab>
        </Tabs>
      ) : (
        <div></div>
      )}
    </React.Fragment>
  );
};
