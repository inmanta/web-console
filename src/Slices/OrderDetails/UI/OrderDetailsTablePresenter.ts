import { ServiceOrderItem } from "@/Slices/Orders/Core/Query";
import { ColumnHead, TablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

/**
 * OrderDetailsTablePresenter @Class
 *
 * Implements the TablePresenter @Class <ServiceOrderItem, ServiceOrderItem>
 * The presenters contain all the needed data-transformation methods to create a table for the OrderDetailView.
 *
 */
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

  /**
   * @method createRows
   * creates the data needed to populate the rows.
   *
   * @param sourceData ServiceOrderItem[]
   * @returns ServiceOrderItem[]
   */
  createRows(sourceData: ServiceOrderItem[]): ServiceOrderItem[] {
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
    const sortableColumns = [];
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
