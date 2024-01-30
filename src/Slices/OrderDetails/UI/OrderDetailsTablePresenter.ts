import { ServiceOrderItem } from "@/Slices/Orders/Core/Query";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

export class OrderDetailsTablePresenter
  implements TablePresenter<ServiceOrderItem, ServiceOrderItem>
{
  readonly columnHeads: ColumnHead[];
  readonly numberOfColumns: number;

  constructor() {
    this.columnHeads = [
      {
        displayName: words("orders.column.instanceId"),
        apiName: "instance_id",
      },
      {
        displayName: words("orders.column.serviceEntity"),
        apiName: "service_entity",
      },
      {
        displayName: words("orders.column.action"),
        apiName: "action",
      },
      {
        displayName: words("orders.column.status"),
        apiName: "status",
      },
    ];
    this.numberOfColumns = this.columnHeads.length + 1;
  }

  createRows(sourceData: ServiceOrderItem[]): ServiceOrderItem[] {
    return sourceData;
  }

  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map(({ displayName }) => displayName);
  }

  getSortableColumnNames(): string[] {
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
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName,
    );
  }
}
