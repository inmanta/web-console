import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { ServiceOrder } from "../Core/Query";

export class OrdersTablePresenter
  implements TablePresenter<ServiceOrder, ServiceOrder>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      {
        displayName: words("orders.column.created_at"),
        apiName: "created_at",
      },
      {
        displayName: words("orders.column.completed_at"),
        apiName: "completed_at",
      },
      {
        displayName: words("orders.column.status"),
        apiName: "status",
      },
      {
        displayName: words("orders.column.progress"),
        apiName: "progress",
      },
      {
        displayName: words("orders.column.description"),
        apiName: "description",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: ServiceOrder[]): ServiceOrder[] {
    return sourceData;
  }

  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map(({ displayName }) => displayName);
  }

  getSortableColumnNames(): string[] {
    const sortableColumns = ["created_at"];
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
