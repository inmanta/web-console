import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { ServiceOrder } from "../Core/Query";

/**
 * OrdersTablePresenter @Class
 *
 * Implements the TablePresenter <ServiceOrder, ServiceOrder>
 * The presenters contain all the needed data-transformation methods to create a table for the OrderView.
 *
 */
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

  /**
   * @method createRows
   * creates the data needed to populate the rows.
   *
   * @param sourceData ServiceOrder[]
   * @returns ServiceOrder[]
   */
  createRows(sourceData: ServiceOrder[]): ServiceOrder[] {
    return sourceData;
  }

  /**
   * @method getColumnHeadDisplayNames
   * Getter for the display names for the headers.
   *
   * @returns string[]
   */
  getColumnHeadDisplayNames(): string[] {
    return this.columnHeads.map(({ displayName }) => displayName);
  }

  /**
   * @method getSortableColumnNames
   * Getter for the list of sortable columns.
   *
   * @returns string[]
   */
  getSortableColumnNames(): string[] {
    const sortableColumns = ["created_at"];
    return sortableColumns;
  }

  /**
   * @method getColumnHeads
   * Getters for the full columnheads data.
   *
   * @returns ColumnHead[]
   */
  getColumnHeads(): ColumnHead[] {
    return this.columnHeads;
  }

  /**
   * @method getNumberOfColumns
   * Getter for the numberOfColumns
   *
   * @returns number
   */
  getNumberOfColumns(): number {
    return this.numberOfColumns;
  }

  /**
   * @method getColumnNameForIndex
   * Getter for a specific ColumnName based on their index.
   *
   * @param index number
   * @returns string | undefined
   */
  getColumnNameForIndex(index: number): string | undefined {
    if (index > -1 && index < this.getNumberOfColumns()) {
      return this.getColumnHeads()[index].apiName;
    }
    return undefined;
  }

  /**
   * @method getIndexForColumnName
   * Getter for a specific index based on the ColumnName
   *
   * @param columnName string
   * @returns number
   */
  getIndexForColumnName(columnName?: string): number {
    return this.columnHeads.findIndex(
      (columnHead) => columnHead.apiName === columnName,
    );
  }
}
