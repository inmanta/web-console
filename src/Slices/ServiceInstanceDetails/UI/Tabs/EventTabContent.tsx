import React, { useContext, useState } from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TabContent,
} from "@patternfly/react-core";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { InstanceEvent } from "@/Core";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { DependencyContext, words } from "@/UI";
import {
  ErrorView,
  EventIcon,
  LoadingView,
  DateWithTimeDiffTooltip,
  Link,
} from "@/UI/Components";
import { InstanceDetailsContext } from "../../Core/Context";
import { CompileReportLink } from "../Components/CompileReportLink";
import { TabContentWrapper } from "./TabContentWrapper";

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
 * @prop {Props} props - The EventsTabContent Props
 *  @prop {string} selectedVersion - The actively selected version on the page.
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

  const selectedVersionLogs: InstanceLog | undefined = logsQuery.data.filter(
    (log: InstanceLog) => String(log.version) === selectedVersion,
  )[0];

  // When we make an update to the instance, like changing the state, it can briefly happen we don't yet have logs for the version.
  if (!selectedVersionLogs) {
    return (
      <TabContentWrapper id="events">
        <LoadingView />
      </TabContentWrapper>
    );
  }

  const events: InstanceEvent[] = selectedVersionLogs.events;

  /**
   * Check to verify if an event row id is already expanded or not.
   *
   * @param {string} eventId - the event id
   * @returns {boolean}
   */
  const isExpanded = (eventId: string): boolean => expanded.includes(eventId);

  /**
   * Updates the expanded state variable, adding or removing the eventId of the array of expanded items.
   *
   * @param {string} eventId
   * @param {boolean} isExpanding
   * @returns {void}
   */
  const updateExpanded = (eventId: string, isExpanding: boolean = true): void =>
    setExpanded((prevExpanded) => {
      const otherExpanded = prevExpanded.filter((id) => id !== eventId);

      return isExpanding ? [...otherExpanded, eventId] : otherExpanded;
    });

  /**
   * Check if the message in the event contains one of the key-words used in validation reports.
   * If the message doesn't contain "validate/validation" then we can assume it is an export report.
   *
   * @param {string} message - the event message
   * @returns {boolean}
   */
  const isExportReport = (message: string): boolean => {
    const regex = /validate|validation/i;

    return !regex.test(message);
  };

  /**
   * Get the next timestamp in the events log of the selected version.
   *
   * @param {number} index - the index of the current timestamp
   * @returns {string} the timestamp that comes after the current one, or the current timestamp if there is no next index available.
   */
  const getNextTimestamp = (index: number): string => {
    // We want the time difference between each row/timestamp. If we are on the last row, then there is no new row to compare against.
    if (index === events.length - 1) {
      return events[index].timestamp;
    }

    return events[index + 1].timestamp;
  };

  return (
    <TabContent role="tabpanel" id="events">
      <TabContentWrapper>
        <Flex>
          <FlexItem align={{ default: "alignRight" }}>
            <Link
              aria-label="See-all-events"
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
              <Th screenReaderText="Row expansion column" />
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
            <StyledBody $transition={event} key={`styled-row-${index}`}>
              <Tr
                key={index}
                id={`event-row-${event.id}`}
                aria-label="Event-table-row"
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
                <Td aria-label={`Event-date-${index}`}>
                  <DateWithTimeDiffTooltip
                    timestamp1={event.timestamp}
                    timestamp2={getNextTimestamp(index)}
                  />
                </Td>
                <Td aria-label={`Event-source-${index}`}>{event.source}</Td>
                <Td aria-label={`Event-target-${index}`}>
                  {event.destination}
                </Td>
                <Td aria-label={`Event-compile-${index}`}>
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
                        <DescriptionListDescription
                          aria-label={`Event-message-${index}`}
                        >
                          {event.message}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {words("events.details.title")}
                        </DescriptionListTerm>
                        <DescriptionListDescription
                          aria-label={`Event-details-${index}`}
                        >
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

/**
 * The transitions we would like to highlight in the UI
 */
type HighlightedTransition = Pick<
  InstanceEvent,
  "ignored_transition" | "is_error_transition"
>;

/**
 * If the transition is `is_error_transition` then we want the rows in an orange/golden hue.
 * Unlike on the main event page, the history logs don't contain the `ignored_transition`.
 * These are grayed out in the main event page.
 */
const StyledBody = styled(Tbody)<{ $transition: HighlightedTransition }>`
  ${({ $transition }) => {
    return $transition.is_error_transition
      ? "var(--pf-t--global--color--status--warning--default)"
      : "background-color: inherit";
  }};
`;
