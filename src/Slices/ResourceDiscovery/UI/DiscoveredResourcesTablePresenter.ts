import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { DiscoveredResource } from "../Core/Query";

export class DiscoveredResourcesTablePresenter
  implements TablePresenter<DiscoveredResource, DiscoveredResource>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      {
        displayName: words("discovered.column.resource_id"),
        apiName: "discovered_resource_id",
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
    const sortableColumns = ["discovered_resource_id"];
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
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName,
    );
  }
}
