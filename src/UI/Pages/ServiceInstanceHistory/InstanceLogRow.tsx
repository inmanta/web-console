import { AttributesSummary, DateInfo, InstanceLog } from "@/Core";
import {
  AttributesTable,
  DateWithTooltip,
  EventsTable,
  EventsTablePresenter,
  IconTabs,
  TabDescriptor,
  ExpandableRowProps,
} from "@/UI/Components";
import { AttributesSummaryView } from "@/UI/Pages/ServiceInventory/Components";
import { MomentDatePresenter } from "@/UI/Pages/ServiceInventory/Presenters";
import { InfoCircleIcon, ListIcon, PortIcon } from "@patternfly/react-icons";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React, { useState } from "react";
import { DetailsView } from "./DetailsView";

interface Props extends ExpandableRowProps {
  log: InstanceLog;
  timestamp: DateInfo;
  attributesSummary: AttributesSummary;
  state: React.ReactElement;
}

export const InstanceLogRow: React.FC<Props> = ({
  numberOfColumns,
  isExpanded,
  index,
  onToggle,
  id,
  log,
  timestamp,
  attributesSummary,
  state,
}) => {
  const [activeTab, setActiveTab] = useState("Details");
  const attributesOnClick = () => {
    if (!isExpanded) onToggle();
    setActiveTab("Attributes");
  };

  return (
    <Tbody isExpanded={false}>
      <Tr id={`instance-row-${id}`}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={"version"}>{id}</Td>
        <Td dataLabel={"timestamp"}>
          <DateWithTooltip date={timestamp} />
        </Td>
        <Td dataLabel={"state"}>{state}</Td>
        <Td dataLabel={"Attributes"}>
          <a href={`#instance-row-${id}`}>
            <AttributesSummaryView
              summary={attributesSummary}
              onClick={attributesOnClick}
            />
          </a>
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`details_${id}`}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <IconTabs
              activeTab={activeTab}
              onChange={setActiveTab as (a: string) => void}
              tabs={[
                detailsTab(state, log.version, timestamp.full),
                attributesTab(log),
                eventsTab(log),
              ]}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

const detailsTab = (
  state: React.ReactElement,
  version: number,
  timestamp: string
): TabDescriptor => ({
  id: "Details",
  title: "Details",
  icon: <InfoCircleIcon />,
  view: <DetailsView info={{ state, version, timestamp }} />,
});

const attributesTab = (log: InstanceLog): TabDescriptor => ({
  id: "Attributes",
  title: "Attributes",
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

const eventsTab = (log: InstanceLog): TabDescriptor => ({
  id: "Events",
  title: "Events",
  icon: <PortIcon />,
  view: (
    <EventsTable
      events={log.events}
      environmentId={log.environment}
      tablePresenter={new EventsTablePresenter(new MomentDatePresenter())}
    />
  ),
});
