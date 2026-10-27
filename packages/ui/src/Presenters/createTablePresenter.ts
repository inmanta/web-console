export interface ColumnHead {
  apiName: string;
  displayName: string;
}

/**
 * The shape every table presenter exposes. Built by createTablePresenter so all
 * tables share one consistent API for columns, sorting and row creation. Context
 * is the extra input createRows needs (void when a table needs none).
 */
export interface TablePresenter<Source, Row, Context = void> {
  createRows(sourceData: Source[], context: Context): Row[];
  getColumnHeads(): readonly ColumnHead[];
  getColumnHeadDisplayNames(): string[];
  getNumberOfColumns(): number;
  getColumnNameForIndex(index: number): string | undefined;
  getIndexForColumnName(columnName?: string): number;
  getSortableColumnNames(): string[];
}

/**
 * Config for a table presenter: its columns, the row mapper and, optionally, the
 * sortable columns and any extra non-data columns (actions, expand toggles) that
 * still count towards the number of columns.
 */
interface TablePresenterConfig<Source, Row, Context> {
  columnHeads: readonly ColumnHead[];
  createRows: (sourceData: Source[], context: Context) => Row[];
  sortableColumns?: string[];
  extraColumns?: number;
}

/**
 * Build a table presenter from its column config and row mapper, replacing the
 * old class-based presenters with one shared functional implementation. Context
 * defaults to void; set it when createRows needs more than the source data.
 *
 * @example
 * createTablePresenter<Fact, Fact>({ columnHeads, sortableColumns: ["name"], createRows: (facts) => facts })
 */
export function createTablePresenter<Source, Row, Context = void>({
  columnHeads,
  createRows,
  sortableColumns = [],
  extraColumns = 0,
}: TablePresenterConfig<Source, Row, Context>): TablePresenter<Source, Row, Context> {
  const numberOfColumns = columnHeads.length + extraColumns;

  return {
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
