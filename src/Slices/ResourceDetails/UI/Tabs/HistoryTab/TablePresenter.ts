import { ColumnHead, DatePresenter, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import {
  ResourceHistory,
  ResourceHistoryRow,
} from "@S/ResourceDetails/Core/ResourceHistory";

export class ResourceHistoryTablePresenter
  implements TablePresenter<ResourceHistory, ResourceHistoryRow>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor(private readonly datePresenter: DatePresenter) {
    this.columnHeads = [
      {
        displayName: words("resources.history.column.date"),
        apiName: "date",
      },
      {
        displayName: words("resources.column.requires"),
        apiName: "requires",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: ResourceHistory[]): ResourceHistoryRow[] {
    return sourceData.map((resource) => ({
      attribute_hash: resource.attribute_hash,
      attributes: resource.attributes,
      date: resource.date,
      numberOfDependencies: resource.requires.length,
      requires: resource.requires,
      id: `${resource.attribute_hash}-${resource.date}`,
    }));
  }
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map((columnHead) => columnHead.displayName);
  }

  public getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
  }

  public getColumnNameForIndex(index: number): string | undefined {
    if (index > -1 && index < this.getNumberOfColumns()) {
      return this.getColumnHeads()[index].apiName;
    }
    return undefined;
  }

  public getIndexForColumnName(columnName?: string): number {
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName
    );
  }

  public getSortableColumnNames(): string[] {
    const sortableColumns = ["date"];
    return sortableColumns;
  }

  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }
}
