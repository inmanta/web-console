import React, { useState } from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { AttributeTable } from "./AttributeTable";
import { LifecycleTable } from "./LifecycleTable";
import { Config } from "./Config";
import { Details } from "./Details";

export const CatalogTabs: React.FunctionComponent<{
  service: ServiceModel;
}> = ({ service }) => {
  const [activeTabKey, setActiveTabKey] = useState(0);

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Tabs
      title=""
      activeKey={activeTabKey}
      onSelect={handleTabClick}
      mountOnEnter
    >
      <Tab eventKey={0} title="Details">
        <Details
          serviceName={service.name}
          instanceSummary={service.instance_summary}
        />
      </Tab>
      <Tab eventKey={1} title="Attributes">
        <AttributeTable attributes={service.attributes} />
      </Tab>
      <Tab eventKey={2} title="Lifecycle States">
        <LifecycleTable lifecycle={service.lifecycle} />
      </Tab>
      <Tab eventKey={3} title="Config">
        <Config serviceName={service.name} />
      </Tab>
    </Tabs>
  );
};
