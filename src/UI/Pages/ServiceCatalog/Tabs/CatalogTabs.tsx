import React, { useState } from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { AttributeTable } from "./AttributeTable";
import { LifecycleTable } from "./LifecycleTable";
import { Config } from "./Config";

export const CatalogTabs: React.FunctionComponent<{
  service: ServiceModel;
}> = (props) => {
  const [activeTabKey, setActiveTabKey] = useState(0);

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Tabs title="" activeKey={activeTabKey} onSelect={handleTabClick}>
      <Tab eventKey={0} title="Attributes">
        <AttributeTable attributes={props.service.attributes} />
      </Tab>
      <Tab eventKey={1} title="Lifecycle States">
        <LifecycleTable lifecycle={props.service.lifecycle} />
      </Tab>
      <Tab eventKey={2} title="Config">
        <Config serviceName={props.service.name} />
      </Tab>
    </Tabs>
  );
};
