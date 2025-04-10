import React from "react";
import { Tabs, Tab, TabContentBody } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { AttributeTable } from "./AttributeTable";
import { CallbacksView } from "./Callbacks";
import { Config } from "./Config";
import { Details } from "./Details";
import { LifecycleTable } from "./LifecycleTable";

interface Props {
  service: ServiceModel;
}

export const CatalogTabs: React.FunctionComponent<Props> = ({ service }) => {
  const [activeTabKey, setActiveTabKey] = useUrlStateWithString({
    default: "details",
    key: `tab-${service.name}`,
    route: "Catalog",
  });
  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Tabs title="" activeKey={activeTabKey} onSelect={handleTabClick} mountOnEnter>
      <Tab eventKey="details" title="Details">
        <Details instanceSummary={service.instance_summary} />
      </Tab>
      <Tab eventKey="attributes" title="Attributes">
        <TabContentBody hasPadding>
          <AttributeTable service={service} />
        </TabContentBody>
      </Tab>
      <Tab eventKey="lifecycle_states" title="Lifecycle States">
        <TabContentBody hasPadding>
          <LifecycleTable lifecycle={service.lifecycle} />
        </TabContentBody>
      </Tab>
      <Tab eventKey="config" title="Config">
        <Config serviceName={service.name} />
      </Tab>
      <Tab eventKey="callbacks" title="Callbacks">
        <CallbacksView service_entity={service.name} />
      </Tab>
    </Tabs>
  );
};
