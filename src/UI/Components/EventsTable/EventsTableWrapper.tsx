import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { EventsTablePresenter } from "./EventsTablePresenter";

interface Props {
  tablePresenter: EventsTablePresenter;
  wrapInTd?: boolean;
  "aria-label"?: string;
}

export const EventsTableWrapper: React.FC<Props> = ({
  tablePresenter,
  wrapInTd,
  children,
  ...props
}) => {
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column) => <Th key={column}>{column}</Th>);
  return (
    <TableComposable aria-label={props["aria-label"]}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {wrapInTd ? (
        <Tbody>
          <Tr>
            <Td colSpan={tablePresenter.getNumberOfColumns()}>{children}</Td>
          </Tr>
        </Tbody>
      ) : (
        children
      )}
    </TableComposable>
  );
};
