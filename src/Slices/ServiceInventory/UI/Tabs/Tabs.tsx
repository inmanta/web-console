import React, { useRef } from "react";
import { Tooltip } from "@patternfly/react-core";
import {
  AutomationIcon,
  CogIcon,
  InfoCircleIcon,
  ListIcon,
} from "@patternfly/react-icons";
import { Row, ServiceModel, VersionedServiceInstanceIdentifier } from "@/Core";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { ConfigTab } from "./ConfigTab";
import { DocumentationTab } from "./DocumentationTab";
import { ResourcesTab } from "./ResourcesTab";
import { StatusTab } from "./StatusTab";

/**
 * Enum representing the available tab keys.
 */
export enum TabKey {
  Status = "Status",
  Attributes = "Attributes",
  Resources = "Resources",
  Events = "Events",
  Config = "Config",
}

interface Props {
  activeTab: TabKey | string;
  setActiveTab: (tabKey: TabKey | string) => void;
  row: Row;
  state: React.ReactElement | null;
  service?: ServiceModel;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

/**
 * Component that renders the tabs for the service inventory.
 *
 * @props Props - The component props.
 *  @prop {TabKey | string} activeTab - The active tab.
 *  @prop {function} setActiveTab - The callback for setting the active tab.
 *  @prop {Row} row - The row object.
 *  @prop {React.ReactElement | null} state - The state element.
 *  @prop {ServiceModel} service - The service model.
 *  @prop {VersionedServiceInstanceIdentifier} serviceInstanceIdentifier - The service instance identifier.
 *
 * @returns The tabs component.
 */
export const Tabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  row,
  state,
  service,
  serviceInstanceIdentifier,
}) => {
  const configTooltipRef = useRef<HTMLElement>();
  const configTabDisabled = row.deleted || !!row.configDisabled;

  return (
    <>
      <IconTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          statusTab(row, state),
          ...documentationTab(row, service),
          attributesTab(row, setActiveTab, service),
          resourcesTab(serviceInstanceIdentifier),
          configTab(
            configTabDisabled,
            serviceInstanceIdentifier,
            configTooltipRef,
          ),
        ]}
      />
      {configTabDisabled && (
        <Tooltip
          content={words("config.disabled")}
          triggerRef={configTooltipRef}
        />
      )}
    </>
  );
};

const datePresenter = new MomentDatePresenter();

/**
 * Creates the status tab descriptor.
 *
 * @param row - The row object.
 * @param state - The state element.
 * @returns The status tab descriptor.
 */
const statusTab = (
  row: Row,
  state: React.ReactElement | null,
): TabDescriptor<TabKey> => ({
  id: TabKey.Status,
  title: words("inventory.tabs.status"),
  icon: <InfoCircleIcon />,
  view: (
    <StatusTab
      statusInfo={{
        instanceId: row.id.full,
        state,
        version: row.version,
        createdAt: datePresenter.getFull(row.createdAt),
        updatedAt: datePresenter.getFull(row.updatedAt),
      }}
    />
  ),
});

/**
 * Creates the attributes tab descriptor.
 *
 * @param row - The row object.
 * @param service - The service model.
 * @returns The attributes tab descriptor.
 */
const attributesTab = (
  row: Row,
  setActiveTab: (tabKey: TabKey | string) => void,
  service?: ServiceModel,
): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("inventory.tabs.attributes"),
  icon: <ListIcon />,
  view: (
    <AttributesTab
      attributes={row.attributes}
      id={row.id.full}
      service={service}
      version={row.version}
      setTab={setActiveTab}
    />
  ),
});

/**
 * Creates the resources tab descriptor.
 *
 * @param serviceInstanceIdentifier - The service instance identifier.
 * @returns The resources tab descriptor.
 */
const resourcesTab = (
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier,
): TabDescriptor<TabKey> => ({
  id: TabKey.Resources,
  title: words("inventory.tabs.resources"),
  icon: <AutomationIcon />,
  view: <ResourcesTab serviceInstanceIdentifier={serviceInstanceIdentifier} />,
});

/**
 * Creates the config tab descriptor.
 *
 * @param isDisabled - Indicates if the config tab is disabled.
 * @param serviceInstanceIdentifier - The service instance identifier.
 * @param ref - The ref object.
 * @returns The config tab descriptor.
 */
const configTab = (
  isDisabled: boolean,
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier,
  ref: React.MutableRefObject<HTMLElement | undefined>,
): TabDescriptor<TabKey> => ({
  id: TabKey.Config,
  title: words("config.title"),
  icon: <CogIcon />,
  view: <ConfigTab serviceInstanceIdentifier={serviceInstanceIdentifier} />,
  isDisabled,
  ref,
});

/**
 * Creates an array of documentation tab descriptors.
 *
 * @param row - The row object.
 * @param service - The service model.
 * @returns An array of documentation tab descriptors.
 */
const documentationTab = (
  row: Row,
  service?: ServiceModel,
): TabDescriptor<string>[] => {
  // check in the row if there are web_presentation attributes and if they are set to documentation.
  const webPresentationAttributes: TabDescriptor<string>[] = [];

  if (service && service.attributes) {
    for (const attribute of service.attributes) {
      if (
        attribute.attribute_annotations &&
        attribute.attribute_annotations.web_title &&
        attribute.attribute_annotations.web_presentation === "documentation"
      ) {
        const attributeValue = getAttributeValue(attribute.name, row);
        webPresentationAttributes.push({
          id: attribute.attribute_annotations.web_title,
          icon: (
            <DynamicFAIcon
              icon={attribute.attribute_annotations.web_icon || "FaBook"}
            />
          ),
          view: (
            <DocumentationTab
              attributeValue={attributeValue}
              web_title={attribute.attribute_annotations.web_title}
            />
          ),
          title: attribute.attribute_annotations.web_title,
        });
      }
    }
  }

  return webPresentationAttributes;
};

/**
 * Gets the attribute value from the row object.
 *
 * @param attributeName - The name of the attribute.
 * @param row - The row object.
 * @returns The attribute value.
 */
const getAttributeValue = (attributeName: string, row: Row) => {
  if (
    row.attributes &&
    row.attributes.active &&
    row.attributes.active[attributeName]
  ) {
    return row.attributes.active[attributeName];
  }
  if (
    row.attributes &&
    row.attributes.candidate &&
    row.attributes.candidate[attributeName]
  ) {
    return row.attributes.candidate[attributeName];
  }
  if (
    row.attributes &&
    row.attributes.rollback &&
    row.attributes.rollback[attributeName]
  ) {
    return row.attributes.rollback[attributeName];
  }

  return "No data available for this attribute.";
};
