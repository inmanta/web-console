import { ServiceModel } from "@/Core";

export interface ColumnHead {
  apiName: string;
  displayName: string;
}

/**
 * The shape every table presenter exposes. Built by createTablePresenter so all
 * tables share one consistent API for columns, sorting and row creation.
 */
export interface TablePresenter<S, T> {
  columnHeads: ColumnHead[];
  numberOfColumns: number;
  createRows(sourceData: S[], service?: ServiceModel): T[];
  getColumnHeads(): ColumnHead[];
  getColumnHeadDisplayNames(): string[];
  getNumberOfColumns(): number;
  getColumnNameForIndex(index: number): string | undefined;
  getIndexForColumnName(columnName?: string): number;
  getSortableColumnNames(): string[];
}

/**
 * Config for a table presenter: its columns, the row mapper and, optionally, the
 * sortable columns and any extra non-data columns (actions, expand toggles) that
 * still count towards numberOfColumns.
 */
interface TablePresenterConfig<S, T> {
  columnHeads: ColumnHead[];
  createRows: (sourceData: S[], service?: ServiceModel) => T[];
  sortableColumns?: string[];
  extraColumns?: number;
}

/**
 * Build a table presenter from its column config and row mapper, replacing the
 * old class-based presenters with one shared functional implementation.
 *
 * @example
 * createTablePresenter<Fact, Fact>({ columnHeads, sortableColumns: ["name"], createRows: (facts) => facts })
 */
export function createTablePresenter<S, T>({
  columnHeads,
  createRows,
  sortableColumns = [],
  extraColumns = 0,
}: TablePresenterConfig<S, T>): TablePresenter<S, T> {
  const numberOfColumns = columnHeads.length + extraColumns;

  return {
    columnHeads,
    numberOfColumns,
    createRows,
    getColumnHeads: () => columnHeads,
    getColumnHeadDisplayNames: () => columnHeads.map((columnHead) => columnHead.displayName),
    getNumberOfColumns: () => numberOfColumns,
    getColumnNameForIndex: (index) =>
      index > -1 && index < columnHeads.length ? columnHeads[index].apiName : undefined,
    getIndexForColumnName: (columnName) =>
      columnHeads.findIndex((columnHead) => columnHead.apiName === columnName),
    getSortableColumnNames: () => sortableColumns,
  };
}
