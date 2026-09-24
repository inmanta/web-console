import React, { memo, useCallback } from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { MultiSort } from "@/Data";
import { words } from "@/UI";
import { StatusSortMenu } from "./Components";
import {
  ResourceTableRow,
  ResourceTableRowSkeleton,
  ResourceTableRow_Fragment,
} from "./ResourceTableRow";
import { createResourcesTablePresenter } from "./ResourcesTablePresenter";
import type { FragmentType } from "@apollo/client";

const tablePresenter = createResourcesTablePresenter();
const sortableColumns = tablePresenter.getSortableColumnNames();

/**
 * Props of the resources table. Each resource is a masked ref that its row reads through its own fragment.
 * While `resources` is undefined, the table shows `loadingRowCount` placeholder rows under the real headers.
 */
interface Props {
  resources:
    (FragmentType<typeof ResourceTableRow_Fragment> & { resourceId: string })[] | undefined;
  loadingRowCount: number;
  sort: MultiSort<Resource.SortKey>;
  setSort: (sort: MultiSort<Resource.SortKey>) => void;
}

export const ResourcesTable: React.FC<Props> = memo(
  ({ resources, loadingRowCount, sort, setSort, ...props }) => {
    const onSort: OnSort = useCallback(
      (_event, index, order) => {
        const name = tablePresenter.getColumnNameForIndex(index) as Resource.SortKey;
        setSort([{ name, order }]);
      },
      [setSort]
    );

    const activeRegularSort = sort.find((sortEntry) => !Resource.isStatusSortKey(sortEntry.name));

    const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }, columnIndex) => {
      if (apiName === "status") {
        return (
          <Th style={{ textAlign: "end", overflow: "visible" }} key={displayName}>
            <StatusSortMenu sort={sort} setSort={setSort} />
          </Th>
        );
      }

      const hasSort = sortableColumns.includes(apiName);
      const sortParams = hasSort
        ? {
            sort: {
              sortBy: {
                index: activeRegularSort
                  ? tablePresenter.getIndexForColumnName(activeRegularSort.name)
                  : undefined,
                direction: activeRegularSort?.order ?? "asc",
              },
              onSort,
              columnIndex,
            },
            "data-testid": `sort-${displayName}`,
          }
        : {};

      return (
        <Th key={displayName} {...sortParams} modifier="nowrap">
          {displayName}
        </Th>
      );
    });

    return (
      <Table {...props} isStickyHeader variant={TableVariant.compact}>
        <Thead>
          <Tr>
            {heads}
            <Th
              modifier="fitContent"
              screenReaderText={words("common.emptyColumnHeader")}
              aria-label="Details"
            />
          </Tr>
        </Thead>
        {resources
          ? resources.map((resource) => (
              <ResourceTableRow resource={resource} key={resource.resourceId} />
            ))
          : Array.from({ length: loadingRowCount }, (_, index) => (
              <ResourceTableRowSkeleton key={index} index={index} />
            ))}
      </Table>
    );
  }
);
