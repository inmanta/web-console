import React from "react";
import styled from "styled-components";
import { Tabs, Tab } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { AttributeTable } from "./AttributeTable";
import { LifecycleTable } from "./LifecycleTable";
import { Config } from "./Config";
import { Details } from "./Details";
import { CallbacksView } from "./Callbacks";
import { useUrlStateWithString } from "@/Data";

export const CatalogTabs: React.FunctionComponent<{
  service: ServiceModel;
}> = ({ service }) => {
  const [activeTabKey, setActiveTabKey] = useUrlStateWithString({
    default: "details",
    key: `tab-${service.name}`,
    route: "Catalog",
  });

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
      <Tab eventKey="details" title="Details">
        <Details
          serviceName={service.name}
          instanceSummary={service.instance_summary}
        />
      </Tab>
      <Tab eventKey="attributes" title="Attributes">
        <OverflowContainer>
          <AttributeTable attributes={service.attributes} />
        </OverflowContainer>
      </Tab>
      <Tab eventKey="lifecycle_states" title="Lifecycle States">
        <OverflowContainer>
          <LifecycleTable lifecycle={service.lifecycle} />
        </OverflowContainer>
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

const OverflowContainer = styled.div`
  overflow-x: auto;
`;
