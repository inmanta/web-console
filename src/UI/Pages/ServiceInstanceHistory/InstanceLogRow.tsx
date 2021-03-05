import {
  AttributesSummary,
  DateInfo,
  InstanceEvent,
  InstanceLog,
} from "@/Core";
import { DateWithTooltip, EmptyFiller, SimpleTabs } from "@/UI/Components";
import { ExpandableRowProps } from "@/UI/Components/ExpandableTable";
import {
  EventTable,
  EventTablePresenter,
  FillerEventTable,
} from "@/UI/InstanceEventView";
import { AttributesView } from "@/UI/ServiceInstanceDetails";
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
    if (!isExpanded) {
      onToggle();
    }
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
            <SimpleTabs
              activeTab={activeTab}
              onChange={setActiveTab as (a: string) => void}
              tabs={[
                {
                  id: "Details",
                  title: "Details",
                  icon: <InfoCircleIcon />,
                  view: (
                    <DetailsView
                      info={{
                        state: null,
                        version: log.version,
                        timestamp: timestamp.full,
                      }}
                    />
                  ),
                },
                {
                  id: "Attributes",
                  title: "Attributes",
                  icon: <ListIcon />,
                  view: (
                    <AttributesView
                      title={"Attributes"}
                      icon={<ListIcon />}
                      attributes={{
                        candidate: log.candidate_attributes,
                        active: log.active_attributes,
                        rollback: log.rollback_attributes,
                      }}
                    />
                  ),
                },
                {
                  id: "Events",
                  title: "Events",
                  icon: <PortIcon />,
                  view: (
                    <EventsView
                      events={log.events}
                      environmentId={log.environment}
                    />
                  ),
                },
              ]}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

interface EventsViewProps {
  events: InstanceEvent[];
  environmentId: string;
}

const EventsView: React.FC<EventsViewProps> = ({ events, environmentId }) => {
  const tablePresenter = new EventTablePresenter(new MomentDatePresenter());
  return events.length === 0 ? (
    <FillerEventTable
      tablePresenter={tablePresenter}
      filler={<EmptyFiller />}
      wrapInTd
      aria-label="EventTable-Empty"
    />
  ) : (
    <FillerEventTable
      tablePresenter={tablePresenter}
      filler={
        <EventTable
          events={events}
          environmentId={environmentId}
          tablePresenter={tablePresenter}
        />
      }
      aria-label="EventTable-Success"
    />
  );
};
