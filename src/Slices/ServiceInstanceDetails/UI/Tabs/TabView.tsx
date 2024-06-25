import React from "react";
import {
  Panel,
  PanelMain,
  PanelMainBody,
  Tab,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";

export enum InstanceTabKey {
  Documentation = "Documentation",
  Attributes = "Attributes",
  Events = "Events",
  Resources = "Resources",
}

export const TabView: React.FunctionComponent = () => {
  // const { instance } = useContext(InstanceContext);
  const [activeTab, setActiveTab] = useUrlStateWithString<string>({
    default: InstanceTabKey.Documentation,
    key: `tab`,
    route: "InstanceDetails",
  });

  const handleTabClick = (
    _event:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent
      | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTab(String(tabIndex));
  };

  return (
    <Panel variant="raised">
      <PanelMain>
        <PanelMainBody>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabClick}
            isBox
            aria-label="Instance-Details-Tabs"
            role="region"
          >
            <Tab
              eventKey={InstanceTabKey.Documentation}
              title={
                <TabTitleText>{InstanceTabKey.Documentation}</TabTitleText>
              }
              aria-label="documentation content"
            >
              Content Documentation
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Attributes}
              title={<TabTitleText>{InstanceTabKey.Attributes}</TabTitleText>}
              aria-label="attributes content"
            >
              Content attributes
            </Tab>
          </Tabs>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};
