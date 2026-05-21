import React, { useCallback, useRef } from "react";
import { Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { useUrlStateWithExpansion } from "@/Data";
import { scrollRowIntoView } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Reference } from "@S/ResourceDetails/Core/Reference";
import { ReferencesTableRow } from "./ReferencesTableRow";

interface Props {
  references: Reference[];
}

export const ReferencesTable: React.FC<Props> = ({ references }) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "ResourceDetails",
    key: "references-expansion",
  });
  const rowRefs = useRef(new Map<string, React.RefObject<HTMLSpanElement | null>>());

  const getRowRef = useCallback((id: string) => {
    let ref = rowRefs.current.get(id);

    if (!ref) {
      ref = React.createRef<HTMLSpanElement | null>();
      rowRefs.current.set(id, ref);
    }

    return ref;
  }, []);

  const onNavigateToReference = useCallback(
    (id: string) => {
      const target = references.find((reference) => reference.id === id);

      if (!target) {
        return;
      }

      if (!isExpanded(id)) {
        onExpansion(id)();
      }

      scrollRowIntoView(getRowRef(id));
    },
    [references, isExpanded, onExpansion, getRowRef]
  );

  return (
    <Table aria-label="References-Table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th aria-hidden screenReaderText={words("common.emptyColumnHeader")} />
          <Th>{words("resources.references.column.type")}</Th>
          <Th>{words("resources.references.column.id")}</Th>
        </Tr>
      </Thead>
      {references.map((reference, index) => (
        <ReferencesTableRow
          key={reference.id}
          reference={reference}
          index={index}
          isExpanded={isExpanded(reference.id)}
          onToggle={onExpansion(reference.id)}
          onNavigateToReference={onNavigateToReference}
          rowRef={getRowRef(reference.id)}
          numberOfColumns={3}
        />
      ))}
    </Table>
  );
};
