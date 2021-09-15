import React, { useState } from "react";
import styled from "styled-components";
import { Tabs, Tab } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { AttributeTable } from "./AttributeTable";
import { LifecycleTable } from "./LifecycleTable";
import { Config } from "./Config";
import { Details } from "./Details";
import { CallbacksView } from "./Callbacks";

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
        <TabContainer>
          <Details
            serviceName={service.name}
            instanceSummary={service.instance_summary}
          />
        </TabContainer>
      </Tab>
      <Tab eventKey={1} title="Attributes">
        <TabContainer>
          <AttributeTable attributes={service.attributes} />
        </TabContainer>
      </Tab>
      <Tab eventKey={2} title="Lifecycle States">
        <TabContainer>
          <LifecycleTable lifecycle={service.lifecycle} />
        </TabContainer>
      </Tab>
      <Tab eventKey={3} title="Config">
        <TabContainer>
          <Config serviceName={service.name} />
        </TabContainer>
      </Tab>
      <Tab eventKey={4} title="Callbacks">
        <TabContainer>
          <CallbacksView service_entity={service.name} />
        </TabContainer>
      </Tab>
    </Tabs>
  );
};

const TabContainer = styled.div`
  overflow-x: auto;
`;
