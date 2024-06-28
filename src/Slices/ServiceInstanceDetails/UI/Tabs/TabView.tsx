import React from "react";
import {
  Panel,
  PanelMain,
  PanelMainBody,
  Tab,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";
import styled from "styled-components";
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

  const bool = true;

  return (
    <Panel variant="raised">
      <PanelMain>
        <PanelMainBody>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabClick}
            aria-label="Instance-Details-Tabs"
            role="region"
          >
            <Tab
              eventKey={InstanceTabKey.Documentation}
              title={
                <TabTitleText>{InstanceTabKey.Documentation}</TabTitleText>
              }
              aria-label="documentation-content"
            >
              <TabContent role="tabpanel">
                Documentation Content
                {bool && "hey"}
              </TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Attributes}
              title={<TabTitleText>{InstanceTabKey.Attributes}</TabTitleText>}
              aria-label="attributes-content"
            >
              <TabContent role="tabpanel">Attributes Content</TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Events}
              title={<TabTitleText>{InstanceTabKey.Events}</TabTitleText>}
              aria-label="events-content"
            >
              <TabContent role="tabpanel">Events Content</TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Resources}
              title={<TabTitleText>{InstanceTabKey.Resources}</TabTitleText>}
              aria-label="resources-content"
            >
              <TabContent role="tabpanel">Resources Content</TabContent>
            </Tab>
          </Tabs>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

const TabContent = styled.div`
  max-height: calc(100vh - 330px);
`;
