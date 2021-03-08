import { AttributesSummary, DateInfo, InstanceLog } from "@/Core";
import {
  AttributesTable,
  DateWithTooltip,
  EventsTable,
  EventsTablePresenter,
  IconTabs,
  TabDescriptor,
} from "@/UI/Components";
import { ExpandableRowProps } from "@/UI/Components/ExpandableTable";
import { AttributesSummaryView } from "@/UI/ServiceInventory/Components";
import { MomentDatePresenter } from "@/UI/ServiceInventory/Presenters";
import { InfoCircleIcon, ListIcon, PortIcon } from "@patternfly/react-icons";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React, { useState } from "react";
import { DetailsView } from "./DetailsView";

interface Props extends ExpandableRowProps {
  log: InstanceLog;
  timestamp: DateInfo;
  attributesSummary: AttributesSummary;
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
        <Td dataLabel={"state"}>{log.state}</Td>
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
                detailsTab(log.version, timestamp.full),
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

const detailsTab = (version: number, timestamp: string): TabDescriptor => ({
  id: "Details",
  title: "Details",
  icon: <InfoCircleIcon />,
  view: <DetailsView info={{ state: null, version, timestamp }} />,
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
