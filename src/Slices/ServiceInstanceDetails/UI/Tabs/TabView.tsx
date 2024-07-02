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

/**
 * The TabView Component
 *
 * Displays a sequence of tabs for the ServiceInstanceDetails
 * The active tab is stored in the url.
 *
 * TODO: make the documentation tab optional and fallback to attributes tab if no documentation is available.
 * https://github.com/inmanta/web-console/issues/5779
 *
 * @returns {React.FC} A React Component displaying the TabView
 */
export const TabView: React.FunctionComponent = () => {
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
                Temporary Documentation Content
              </TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Attributes}
              title={<TabTitleText>{InstanceTabKey.Attributes}</TabTitleText>}
              aria-label="attributes-content"
            >
              <TabContent role="tabpanel">
                Temporary Attributes Content
              </TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Events}
              title={<TabTitleText>{InstanceTabKey.Events}</TabTitleText>}
              aria-label="events-content"
            >
              <TabContent role="tabpanel">Temporary Events Content</TabContent>
            </Tab>
            <Tab
              eventKey={InstanceTabKey.Resources}
              title={<TabTitleText>{InstanceTabKey.Resources}</TabTitleText>}
              aria-label="resources-content"
            >
              <TabContent role="tabpanel">
                Temporary Resources Content
              </TabContent>
            </Tab>
          </Tabs>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

// The height is calculated to fit the tabs neatly into the page.
// The 330px equals total height of the elements above the tabs with a short margin.
const TabContent = styled.div`
  max-height: calc(100vh - 330px);
`;
