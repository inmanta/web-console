import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { words } from "@/UI/words";
import { Reference } from "@S/ResourceDetails/Core/Reference";
import { ExpandedReferenceView } from "./ExpandedReferenceView";

interface Props {
  reference: Reference;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigateToReference: (id: string) => void;
  rowRef: React.RefObject<HTMLSpanElement | null>;
  numberOfColumns: number;
  index: number;
}

export const ReferencesTableRow: React.FC<Props> = ({
  reference,
  isExpanded,
  onToggle,
  onNavigateToReference,
  rowRef,
  numberOfColumns,
  index,
}) => {
  return (
    <Tbody isExpanded={isExpanded}>
      <Tr aria-label="References Table Row">
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("resources.references.column.type")}>
          <span ref={rowRef}>{reference.type}</span>
        </Td>
        <Td dataLabel={words("resources.references.column.id")}>{reference.id}</Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded data-testid={`reference-details-${reference.id}`}>
          <Td colSpan={numberOfColumns}>
            <ExpandedReferenceView
              reference={reference}
              onNavigateToReference={onNavigateToReference}
            />
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
