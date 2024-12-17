import React, { useContext, useEffect } from "react";
import {
  Panel,
  PanelMain,
  PanelMainBody,
  Tab,
  TabTitleText,
  Tabs,
  Tooltip,
} from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { words } from "@/UI";

import { InstanceDetailsContext } from "../../Core/Context";
import {
  AttributesTabContent,
  DocAttributeDescriptors,
  DocumentationTabContent,
  EventsTabContent,
  ResourcesTabContent,
} from ".";

enum TabKeys {
  DOCUMENTATION = "Documentation",
  ATTRIBUTES = "Attributes",
  EVENTS = "Events",
  RESOURCES = "Resources",
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
export const TabView: React.FC = () => {
  const { serviceModelQuery, instance } = useContext(InstanceDetailsContext);

  const docAttributeDescriptors = getDocumentationAttributeDescriptors(
    serviceModelQuery.data,
  );
  const docsAttributeLength = docAttributeDescriptors.length;

  const [activeTab, setActiveTab] = useUrlStateWithString<TabKeys>({
    default: docsAttributeLength ? TabKeys.DOCUMENTATION : TabKeys.ATTRIBUTES,
    key: `tab`,
    route: "InstanceDetails",
  });

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  const handleTabClick = (
    _event:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent
      | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTab(tabIndex as TabKeys);
  };

  const disabledResourceTabTooltip =
    String(instance.version) !== selectedVersion ? (
      <Tooltip
        content={words("instanceDetails.tabs.disabled.resources-tooltip")}
      />
    ) : undefined;

  useEffect(() => {
    if (
      selectedVersion !== String(instance.version) &&
      activeTab === TabKeys.RESOURCES
    ) {
      setActiveTab(
        docsAttributeLength ? TabKeys.DOCUMENTATION : TabKeys.ATTRIBUTES,
      );
    }
  }, [
    selectedVersion,
    setActiveTab,
    activeTab,
    docsAttributeLength,
    instance.version,
  ]);

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
            {docsAttributeLength > 0 && (
              <Tab
                eventKey={TabKeys.DOCUMENTATION}
                title={
                  <TabTitleText>
                    {words("instanceDetails.tabs.documentation")}
                  </TabTitleText>
                }
                aria-label="documentation-content"
              >
                <DocumentationTabContent
                  docAttributeDescriptors={docAttributeDescriptors}
                  selectedVersion={selectedVersion}
                />
              </Tab>
            )}
            <Tab
              eventKey={TabKeys.ATTRIBUTES}
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
              eventKey={TabKeys.EVENTS}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.events")}
                </TabTitleText>
              }
              aria-label="events-content"
            >
              <EventsTabContent selectedVersion={selectedVersion} />
            </Tab>
            <Tab
              eventKey={TabKeys.RESOURCES}
              title={
                <TabTitleText>
                  {words("instanceDetails.tabs.resources")}
                </TabTitleText>
              }
              aria-label="resources-content"
              isDisabled={String(instance.version) !== selectedVersion}
              isAriaDisabled={String(instance.version) !== selectedVersion}
              tooltip={disabledResourceTabTooltip}
            >
              <ResourcesTabContent />
            </Tab>
          </Tabs>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

/**
 * If there are attributes with the documentation tag in the serviceModel,
 * returns an array containing the needed information
 * to construct the sections in the documentation tab.
 *
 * @param serviceModel - The serviceModel if available.
 * @returns DocAttributeDescriptors[]
 */
const getDocumentationAttributeDescriptors = (
  serviceModel?: ServiceModel,
): DocAttributeDescriptors[] => {
  const docAttributeDescriptors: DocAttributeDescriptors[] = [];

  if (serviceModel && serviceModel.attributes) {
    for (const attribute of serviceModel.attributes) {
      if (
        attribute.attribute_annotations &&
        attribute.attribute_annotations.web_title &&
        attribute.attribute_annotations.web_presentation === "documentation"
      ) {
        docAttributeDescriptors.push({
          title: attribute.attribute_annotations.web_title,
          iconName: attribute.attribute_annotations.web_icon || "FaBook",
          attributeName: attribute.name,
        });
      }
    }
  }

  return docAttributeDescriptors;
};
