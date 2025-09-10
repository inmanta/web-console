import { DiscoveredResource } from "@/Data/Queries";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

/**
 * The DiscoveredResourcesTablePresenter class.
 *
 * This class is responsible of presenting the discovered resources.
 *
 * @returns {DiscoveredResourcesTablePresenter} DiscoveredResourcesTablePresenter class
 */
export class DiscoveredResourcesTablePresenter
  implements TablePresenter<DiscoveredResource, DiscoveredResource>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      {
        displayName: words("discovered.column.type"),
        apiName: "type",
      },
      {
        displayName: words("discovered.column.agent"),
        apiName: "agent",
      },
      {
        displayName: words("discovered.column.value"),
        apiName: "value",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: DiscoveredResource[]): DiscoveredResource[] {
    return sourceData;
  }
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map(({ displayName }) => displayName);
  }
  getSortableColumnNames(): string[] {
    // The api doesn't yet support sorting on type;agent;value, so we don't return any sortable columns for now.
    const sortableColumns = [];

    return sortableColumns;
  }
  getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }

  getColumnNameForIndex(index: number): string | undefined {
    if (index > -1 && index < this.getNumberOfColumns()) {
      return this.getColumnHeads()[index].apiName;
    }

    return undefined;
  }

  getIndexForColumnName(columnName?: string): number {
    return this.columnHeads.findIndex((columnHead) => columnHead.apiName === columnName);
  }
}
