import React from "react";
import {
  OnSort,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Sort } from "@/Core";
import { EventsTablePresenter } from "./EventsTablePresenter";

interface Props {
  tablePresenter: EventsTablePresenter;
  wrapInTd?: boolean;
  "aria-label"?: string;
  sort?: Sort.Type;
  setSort?: (sort: Sort.Type) => void;
}

export const EventsTableWrapper: React.FC<React.PropsWithChildren<Props>> = ({
  tablePresenter,
  wrapInTd,
  children,
  sort,
  setSort,
  ...props
}) => {
  const heads =
    sort && setSort ? (
      <HeadsWithSort
        sort={sort}
        setSort={setSort}
        tablePresenter={tablePresenter}
      />
    ) : (
      tablePresenter
        .getColumnHeadDisplayNames()
        .map((column) => <Th key={column}>{column}</Th>)
    );

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

const HeadsWithSort: React.FC<
  Required<Pick<Props, "setSort" | "sort" | "tablePresenter">>
> = ({ sort, setSort, tablePresenter }) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({ name: sort.name, order });
  };
  // The events table is only sortable by one column
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column, columnIndex) => {
      const sortParams =
        columnIndex == 1
          ? {
              sort: {
                sortBy: {
                  index: 1,
                  direction: sort.order,
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
  return <>{heads}</>;
};
