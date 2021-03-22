import React from "react";
import { InfoCircleIcon, ListIcon, PortIcon } from "@patternfly/react-icons";
import { DateInfo, InstanceLog } from "@/Core";
import {
  AttributesTable,
  EventsTable,
  EventsTablePresenter,
  IconTabs,
  TabDescriptor,
} from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Pages/ServiceInventory/Presenters";
import { words } from "@/UI/words";

import { DetailsView } from "./DetailsView";

export enum TabKey {
  Details = "Details",
  Attributes = "Attributes",
  Events = "Events",
}

interface Props {
  log: InstanceLog;
  timestamp: DateInfo;
  state: React.ReactElement;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({
  log,
  timestamp,
  state,
  activeTab,
  setActiveTab,
}) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[
        detailsTab(state, log.version, timestamp.full),
        attributesTab(log),
        eventsTab(log),
      ]}
    />
  );
};

const detailsTab = (
  state: React.ReactElement,
  version: number,
  timestamp: string
): TabDescriptor<TabKey> => ({
  id: TabKey.Details,
  title: words("history.detailsTab.title"),
  icon: <InfoCircleIcon />,
  view: <DetailsView info={{ state, version, timestamp }} />,
});

const attributesTab = (log: InstanceLog): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("history.attributesTab.title"),
  icon: <ListIcon />,
  view: (
    <AttributesTable
      attributes={{
        candidate: log.candidate_attributes,
        active: log.active_attributes,
        rollback: log.rollback_attributes,
      }}
    />
  ),
});

const eventsTab = (log: InstanceLog): TabDescriptor<TabKey> => ({
  id: TabKey.Events,
  title: words("history.eventsTab.title"),
  icon: <PortIcon />,
  view: (
    <EventsTable
      events={log.events}
      environmentId={log.environment}
      tablePresenter={new EventsTablePresenter(new MomentDatePresenter())}
    />
  ),
});
