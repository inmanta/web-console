import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { ExpansionManager } from "@/UI/ServiceInventory/ExpansionManager";

interface Props {
  columnHeads: string[];
  ids: string[];
}

export const ExpandableTable: React.FC<Props> = ({ columnHeads, ids }) => {
  const expansionManager = new ExpansionManager();
  const heads = columnHeads.map((head) => <Th key={head}>{head}</Th>);

  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(ids)
  );

  // const handleExpansionToggle = (id: string) => () => {
  //   setExpansionState(expansionManager.toggle(expansionState, id));
  // };

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
    </TableComposable>
  );
};
