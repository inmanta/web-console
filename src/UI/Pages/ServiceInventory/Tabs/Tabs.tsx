import React from "react";
import {
  AutomationIcon,
  CogIcon,
  InfoCircleIcon,
  ListIcon,
} from "@patternfly/react-icons";
import { Row, VersionedServiceInstanceIdentifier } from "@/Core";
import { IconTabs, TabDescriptor } from "@/UI/Components";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { ConfigTab, DisabledConfigTab } from "./ConfigTab";
import { ResourcesTab } from "./ResourcesTab";
import { StatusTab } from "./StatusTab";

export enum TabKey {
  Status = "Status",
  Attributes = "Attributes",
  Resources = "Resources",
  Events = "Events",
  Config = "Config",
}

interface Props {
  activeTab: TabKey;
  setActiveTab: (tabKey: TabKey) => void;
  row: Row;
  actions: React.ReactElement | null;
  state: React.ReactElement | null;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const Tabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  row,
  actions,
  state,
  serviceInstanceIdentifier,
}) => (
  <IconTabs
    activeTab={activeTab}
    onChange={setActiveTab}
    tabs={[
      statusTab(row, state, actions),
      attributesTab(row),
      resourcesTab(serviceInstanceIdentifier),
      configTab(row.deleted, serviceInstanceIdentifier),
    ]}
  />
);

const statusTab = (
  row: Row,
  state: React.ReactElement | null,
  actions: React.ReactElement | null
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
        createdAt: row.createdAt.full,
        updatedAt: row.updatedAt.full,
        actions,
      }}
    />
  ),
});

const attributesTab = (row: Row): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("inventory.tabs.attributes"),
  icon: <ListIcon />,
  view: <AttributesTab attributes={row.attributes} id={row.id.short} />,
});

const resourcesTab = (
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier
): TabDescriptor<TabKey> => ({
  id: TabKey.Resources,
  title: words("inventory.tabs.resources"),
  icon: <AutomationIcon />,
  view: <ResourcesTab serviceInstanceIdentifier={serviceInstanceIdentifier} />,
});

const configTab = (
  isDisabled: boolean,
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier
): TabDescriptor<TabKey> => ({
  id: TabKey.Config,
  title: words("config.title"),
  icon: <CogIcon />,
  view: isDisabled ? (
    <DisabledConfigTab />
  ) : (
    <ConfigTab serviceInstanceIdentifier={serviceInstanceIdentifier} />
  ),
});
