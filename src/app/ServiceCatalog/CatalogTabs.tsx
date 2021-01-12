import React, { useState } from "react";
import { Tabs, Tab } from "@patternfly/react-core";
import { IServiceModel } from "@app/Models/LsmModels";
import { AttributeTable } from "./AttributeTable";
import { LifecycleTable } from "./LifecycleTable";

export const CatalogTabs: React.FunctionComponent<{
  service: IServiceModel;
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
    </Tabs>
  );
};
