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
import { words } from "@/UI";

import {
  AttributesTabContent,
  DocumentationTabContent,
  EventsTabContent,
  ResourcesTabContent,
} from ".";

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
export const TabView: React.FC = () => {
  // const { serviceModelQuery } = useContext(InstanceDetailsContext);
  const [activeTab, setActiveTab] = useUrlStateWithString<string>({
    default: "0",
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

  // const documentationAttributeKeys = getDocumentationAttributeKeys(serviceModelQuery.data);

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
              eventKey={"0"}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.documentation")}
                </TabTitleText>
              }
              aria-label="documentation-content"
            >
              <DocumentationTabContent />
            </Tab>
            <Tab
              eventKey={"1"}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.attributes")}
                </TabTitleText>
              }
              aria-label="attributes-content"
            >
              <AttributesTabContent />
            </Tab>
            <Tab
              eventKey={"2"}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.events")}
                </TabTitleText>
              }
              aria-label="events-content"
            >
              <EventsTabContent />
            </Tab>
            <Tab
              eventKey={"3"}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.resources")}
                </TabTitleText>
              }
              aria-label="resources-content"
            >
              <ResourcesTabContent />
            </Tab>
          </Tabs>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

// const getDocumentationAttributeKeys = (serviceModel?: ServiceModel) => {
//   const documentationAttributeKeys: { title: string; iconName: string }[] = [];

//   if (serviceModel && serviceModel.attributes) {
//     for (const attribute of serviceModel.attributes) {
//       if (
//         attribute.attribute_annotations &&
//         attribute.attribute_annotations.web_title &&
//         attribute.attribute_annotations.web_presentation === "documentation"
//       ) {
//         documentationAttributeKeys.push({
//           title: attribute.attribute_annotations.web_title,
//           iconName: attribute.attribute_annotations.web_icon || "FaBook",
//         });
//       }
//     }
//   }
//   return documentationAttributeKeys;
// };
