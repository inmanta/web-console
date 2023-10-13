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
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { AttributesTab } from "./AttributesTab";
import { ConfigTab } from "./ConfigTab";
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
  expertActions: React.ReactElement | null;
  state: React.ReactElement | null;
  service?: ServiceModel;
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const Tabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  row,
  actions,
  expertActions,
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
          statusTab(row, state, actions, expertActions),
          attributesTab(row, service),
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

const statusTab = (
  row: Row,
  state: React.ReactElement | null,
  actions: React.ReactElement | null,
  expertActions: React.ReactElement | null,
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
        actions,
        expertActions,
      }}
    />
  ),
});

const attributesTab = (
  row: Row,
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
    />
  ),
});

const resourcesTab = (
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier,
): TabDescriptor<TabKey> => ({
  id: TabKey.Resources,
  title: words("inventory.tabs.resources"),
  icon: <AutomationIcon />,
  view: <ResourcesTab serviceInstanceIdentifier={serviceInstanceIdentifier} />,
});

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
