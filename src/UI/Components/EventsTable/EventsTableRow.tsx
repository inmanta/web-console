import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { EventRow } from "@/Core";
import { DateWithTooltip } from "@/UI/Components/DateWithTooltip";
import { EventIcon } from "@/UI/Components/EventIcon";
import { words } from "@/UI/words";
import { CompileReportLink } from "./CompileReportLink";

interface Props {
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  row: EventRow;
}

export const EventsTableRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => (
  <StyledBody isExpanded={false} $transition={row}>
    <Tr id={`event-row-${row.id}`} aria-label="Event table row">
      <Td
        expand={{
          rowIndex: index,
          isExpanded,
          onToggle,
        }}
      />
      <Td>
        <EventIcon eventType={row.eventType} />
      </Td>
      <Td>
        <DateWithTooltip timestamp={row.timestamp} />
      </Td>
      <Td>{row.serviceInstanceVersion as React.ReactNode}</Td>
      <Td>{row.source}</Td>
      <Td>{row.destination}</Td>
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${row.id}`}>
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("events.column.message")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {row.message}
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
                  <code>{JSON.stringify(row.fullJson, null, 2)}</code>
                </pre>
              </DescriptionListDescription>
            </DescriptionListGroup>
            {row.idCompileReport && (
              <CompileReportLink compileId={row.idCompileReport} />
            )}
          </DescriptionList>
        </ExpandableRowContent>
      </Td>
    </Tr>
  </StyledBody>
);

type Transition = Pick<EventRow, "ignoredTransition" | "isErrorTransition">;

const StyledBody = styled(Tbody)<{ $transition: Transition }>`
  ${({ $transition }) =>
    $transition.isErrorTransition
      ? "background-color: var(--pf-v5-global--palette--gold-50)"
      : $transition.ignoredTransition
      ? "background-color: var(--pf-v5-global--palette--black-200)"
      : ""};
`;
