import { EventRow } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React from "react";
import { DateWithTooltip, EventIcon } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileReportLink } from "./CompileReportLink";

interface Props {
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  row: EventRow;
  environmentId: string;
}

export const EventsTableRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
  environmentId,
}) => {
  const getColorCodeClass = (row) => {
    if (row.isErrorTransition) {
      return "error-transition";
    } else if (row.ignoredTransition) {
      return "ignored-transition";
    }
    return "";
  };
  return (
    <Tbody isExpanded={false} className={getColorCodeClass(row)}>
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
          <DateWithTooltip date={row.timestamp} />
        </Td>
        <Td>{row.serviceInstanceVersion}</Td>
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
              <CompileReportLink
                compileReportId={row.idCompileReport}
                environmentId={environmentId}
              />
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
