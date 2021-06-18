import { SortDirection } from "@/Core";
import {
  OnSort,
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
  order?: SortDirection;
  setOrder?: (order: SortDirection) => void;
}

export const EventsTableWrapper: React.FC<Props> = ({
  tablePresenter,
  wrapInTd,
  children,
  order,
  setOrder,
  ...props
}) => {
  const onSort: OnSort = (event, index, direction) => {
    setOrder && setOrder(direction);
  };
  // The events table is only sortable by one column
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column, columnIndex) => {
      const sortParams =
        setOrder && columnIndex == 1
          ? {
              sort: {
                sortBy: {
                  index: 1,
                  direction: order,
                },
                onSort,
                columnIndex,
              },
            }
          : {};
      return (
        <Th key={column} {...sortParams}>
          {column}
        </Th>
      );
    });
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
