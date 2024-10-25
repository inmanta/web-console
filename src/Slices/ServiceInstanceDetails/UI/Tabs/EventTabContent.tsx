import React, { useContext, useState } from "react";
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TabContent,
} from "@patternfly/react-core";
import { InstanceDetailsContext } from "../../Core/Context";
import { TabContentWrapper } from "./TabContentWrapper";
import {
  ErrorView,
  EventIcon,
  LoadingView,
  DateWithTimeDiffTooltip,
  Link,
} from "@/UI/Components";
import { DependencyContext, words } from "@/UI";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { InstanceEvent } from "@/Core";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { CompileReportLink } from "../Components/CompileReportLink";
import styled from "styled-components";

interface Props {
  selectedVersion: string;
}

/**
 * EventsTabContent
 *
 * transitions and their events.
 * The context is lsm instances changing state or trying to change state.
 * As such,
 * 1. each event is bound to an lsm instances
 * An event means that some trigger has arrived to make the instance change state.
 * As such,
 * 2. the event is bound to version of the lsm instance. (The version in which the event was received, which is sometimes a bit confusing)
 * 3. the event is bound to a specific type of transfer, e.g. create or update
 * 4. it may carry information about the trasnfer (source, destination...)
 * To make the transition, mutliple event can be logged, but
 * 5. if multiple events they are about the same transition, they carry the same event_correlation_id
 * When going through a resource transfer, it may start out as a failure transfer (i.e. if the lsm handler signals it to be a failure)
 * 6. on a resource based transfer, is_error_transition is set on all the event when we are going to the error state
 * When doing a validation compile, the transfer starts out as a normal transfer (we assume success)
 * 7. When the validation fails however, we update the is_error_transition to fails on the next event (correlation id remains the same)
 * Sometimes, it happens that a transfer races another one (set state while doing a validation compile e.g.)
 * In that case, a trigger is received, but it is not executed.
 * 8. when a transfer is received, but not executed, we log an ignored_transition
 *
 * The easiest way of looking at it is to consider all event with the same correlation id together.
 * For the is_error_transition  and ignored_transition the state of the last event in the sequence it most relevant
 *
 * @note We are using the events that are pressent in the history logs for the instance details view.
 * A link button allows the user to navigate the the full events page.
 *
 */
export const EventsTabContent: React.FC<Props> = ({ selectedVersion }) => {
  const { logsQuery, instance } = useContext(InstanceDetailsContext);
  const { routeManager } = useContext(DependencyContext);
  const [expanded, setExpanded] = useState<string[]>([]);

  if (logsQuery.isLoading) {
    return (
      <TabContentWrapper id="events">
        <LoadingView />
      </TabContentWrapper>
    );
  }

  if (!logsQuery.data) {
    return (
      <TabContentWrapper id="events">
        <ErrorView message={words("instanceDetails.tabs.events.noData")} />
      </TabContentWrapper>
    );
  }

  const selectedVersionLogs: InstanceLog = logsQuery.data.filter(
    (log) => String(log.version) === selectedVersion,
  )[0];
  const events: InstanceEvent[] = selectedVersionLogs.events;

  const isExpanded = (eventId) => expanded.includes(eventId);

  const updateExpanded = (eventId: string, isExpanding = true) =>
    setExpanded((prevExpanded) => {
      const otherExpanded = prevExpanded.filter((id) => id !== eventId);
      return isExpanding ? [...otherExpanded, eventId] : otherExpanded;
    });

  const isExportReport = (message: string) => {
    const regex = /validate|validation/i;
    return !regex.test(message);
  };

  const getDiffTimestamp = (index: number) => {
    // We want the time difference between each row/timestamp. If we are on the last row, then there is no new row to compare against.
    if (index === events.length - 1) {
      return events[index].timestamp;
    }

    return events[index + 1].timestamp;
  }

  return (
    <TabContent role="tabpanel" id="events">
      <TabContentWrapper>
        <Flex>
          <FlexItem align={{ default: 'alignRight' }}>
            <Link
              pathname={routeManager.getUrl("Events", {
                service: instance.service_entity,
                instance: instance.id,
              })}
            >
              {words("instanceDetails.events.seeAll")}
            </Link>
          </FlexItem>
        </Flex>
        <Table
          aria-label="Expandable-events-table"
          variant="compact"
          isExpandable
        >
          <Thead>
            <Tr>
              <Th screenReaderText="Row expansion" />
              <Th width={15} key="eventType">
                {words("instanceDetails.events.column.eventType")}
              </Th>
              <Th width={20} key="date">
                {words("instanceDetails.events.column.date")}
              </Th>
              <Th width={20} key="source-state">
                {words("instanceDetails.events.column.sourceState")}
              </Th>
              <Th width={20} key="destination-state">
                {words("instanceDetails.events.column.destinationState")}
              </Th>
              <Th width={25} key="report">
                {words("instanceDetails.events.column.report")}
              </Th>
            </Tr>
          </Thead>
          {events.map((event: InstanceEvent, index: number) => (
            <StyledBody $transition={event}>
              <Tr
                key={index}
                id={`event-row-${event.id}`}
                aria-label="Event table row"
              >
                <Td
                  expand={{
                    rowIndex: index,
                    isExpanded: isExpanded(event.id),
                    onToggle: () =>
                      updateExpanded(event.id, !isExpanded(event.id)),
                  }}
                ></Td>
                <Td>
                  <EventIcon eventType={event.event_type} />
                </Td>
                <Td>
                  <DateWithTimeDiffTooltip
                    timestamp1={event.timestamp}
                    timestamp2={getDiffTimestamp(index)}
                  />
                </Td>
                <Td>{event.source}</Td>
                <Td>{event.destination}</Td>
                <Td>
                  {event.id_compile_report && (
                    <CompileReportLink
                      compileId={event.id_compile_report}
                      isExport={isExportReport(event.message)}
                    />
                  )}
                </Td>
              </Tr>
              <Tr
                isExpanded={isExpanded(event.id)}
                data-testid={`details_${event.id}`}
              >
                <Td colSpan={5}>
                  <ExpandableRowContent>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {words("events.column.message")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {event.message}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {words("events.details.title")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <pre
                            style={{
                              whiteSpace: "pre-wrap",
                              fontFamily: "Liberation Mono",
                            }}
                          >
                            <code>{JSON.stringify(event, null, 2)}</code>
                          </pre>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </StyledBody>
          ))}
        </Table>
      </TabContentWrapper>
    </TabContent>
  );
};

type Transition = Pick<
  InstanceEvent,
  "ignored_transition" | "is_error_transition"
>;

/**
 * If the transition is `is_error_transition` then we want the rows in an orange/golden hue.
 * Unlike on the main event page, the history logs don't contain the `ignored_transition`. These are grayed out in the main event page.
 */
const StyledBody = styled(Tbody) <{ $transition: Transition }>`
  ${({ $transition }) => {
    return $transition.is_error_transition
      ? "background-color: var(--pf-v5-global--palette--gold-50)"
      : "";
  }};
`;
