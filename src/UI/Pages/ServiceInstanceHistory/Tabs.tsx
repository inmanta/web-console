import React from "react";
import { InfoCircleIcon, ListIcon, PortIcon } from "@patternfly/react-icons";
import { DateInfo, InstanceLog } from "@/Core";
import {
  AttributesTable,
  EmptyView,
  EventsTableBody,
  EventsTablePresenter,
  EventsTableWrapper,
  IconTabs,
  TabDescriptor,
} from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { DetailsTab } from "./DetailsTab";

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
  title: words("history.tabs.details"),
  icon: <InfoCircleIcon />,
  view: <DetailsTab info={{ state, version, timestamp }} />,
});

const attributesTab = (log: InstanceLog): TabDescriptor<TabKey> => ({
  id: TabKey.Attributes,
  title: words("history.tabs.attributes"),
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
  title: words("history.tabs.events"),
  icon: <PortIcon />,
  view:
    log.events.length === 0 ? (
      <EventsTableWrapper
        tablePresenter={new EventsTablePresenter(new MomentDatePresenter())}
        wrapInTd
        aria-label="EventTable-Empty"
      >
        <EmptyView
          title={words("events.empty.title")}
          message={words("events.empty.body")}
        />
      </EventsTableWrapper>
    ) : (
      <EventsTableWrapper
        tablePresenter={new EventsTablePresenter(new MomentDatePresenter())}
        aria-label="EventTable-Success"
      >
        <EventsTableBody
          events={log.events}
          tablePresenter={new EventsTablePresenter(new MomentDatePresenter())}
        />
      </EventsTableWrapper>
    ),
});
