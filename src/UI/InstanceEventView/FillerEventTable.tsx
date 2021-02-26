import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { ReactElement } from "react";
import { EventTablePresenter } from "./EventTablePresenter";

interface Props {
  tablePresenter: EventTablePresenter;
  filler: ReactElement;
  wrapInTd?: boolean;
  "aria-label"?: string;
}

export const FillerEventTable: React.FC<Props> = ({
  tablePresenter,
  filler,
  wrapInTd,
  ...props
}) => {
  const heads = tablePresenter
    .getColumnHeads()
    .map((column) => <Th key={column}>{column}</Th>);
  return (
    <TableComposable aria-label={props["aria-label"]}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {wrapInTd && (
        <Tbody>
          <Tr>
            <Td colSpan={tablePresenter.getNumberOfColumns()}>{filler}</Td>
          </Tr>
        </Tbody>
      )}
      {!wrapInTd && filler}
    </TableComposable>
  );
};
