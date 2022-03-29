import React from "react";
import { ListIcon, PortIcon } from "@patternfly/react-icons";
import {
  AttributesTable,
  EmptyView,
  EventsTableBody,
  EventsTablePresenter,
  EventsTableWrapper,
  IconTabs,
  TabDescriptor,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { InstanceLog } from "@S/ServiceInstanceHistory/Core/Domain";

export enum TabKey {
  Attributes = "Attributes",
  Events = "Events",
}

interface Props {
  log: InstanceLog;
  timestamp: string;
  state: React.ReactElement;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const Tabs: React.FC<Props> = ({ log, activeTab, setActiveTab }) => {
  return (
    <IconTabs
      activeTab={activeTab}
      onChange={setActiveTab}
      tabs={[attributesTab(log), eventsTab(log)]}
    />
  );
};

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
      <EmptyView
        title={words("events.empty.title")}
        message={words("events.empty.body")}
        aria-label="EventTable-Empty"
      />
    ) : (
      <EventsTableWrapper
        tablePresenter={new EventsTablePresenter()}
        aria-label="EventTable-Success"
      >
        <EventsTableBody
          route="History"
          events={log.events}
          tablePresenter={new EventsTablePresenter()}
        />
      </EventsTableWrapper>
    ),
});
