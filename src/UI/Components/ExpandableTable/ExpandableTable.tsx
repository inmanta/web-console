import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";

export interface ExpandableRowProps {
  id: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

interface Props {
  columnHeads: string[];
  ids: string[];
  Row: React.FC<ExpandableRowProps>;
}

export const ExpandableTable: React.FC<Props> = ({ columnHeads, ids, Row }) => {
  const expansionManager = new ExpansionManager();
  const heads = columnHeads.map((head) => <Th key={head}>{head}</Th>);

  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(ids)
  );

  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };

  React.useEffect(() => {
    setExpansionState(expansionManager.merge(expansionState, ids));
  }, [ids]);

  return (
    <TableComposable>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {ids.map((id, index) => (
        <Row
          id={id}
          key={id}
          index={index}
          numberOfColumns={columnHeads.length + 1}
          onToggle={handleExpansionToggle(id)}
          isExpanded={expansionState[id]}
        />
      ))}
    </TableComposable>
  );
};
