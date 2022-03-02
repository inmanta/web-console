export class ColumnExpansionHelper {
  private readonly maxColumnWidth: number;

  /** Supports at most 1 expanded column
   *
   * @param sumColumnWidth The maximum width all of the columns are allowed to take up together, in percentage of the parent component
   * @param numberOfColumns How many columns should be handled
   * @param minColumnWidth The columns will be at least as wide as this value (in percentage).
   */
  constructor(
    private readonly sumColumnWidth: number,
    private readonly numberOfColumns: number,
    private readonly minColumnWidth: number
  ) {
    this.maxColumnWidth =
      sumColumnWidth - (numberOfColumns - 1) * minColumnWidth;
  }

  isExpanded(columnWidth: number): boolean {
    return this.maxColumnWidth === columnWidth;
  }

  getDefaultState(
    columns: string[],
    emptyColumns: string[]
  ): Record<string, number> {
    if (this.numberOfColumns === emptyColumns.length) {
      const equalColumnWidth = this.sumColumnWidth / this.numberOfColumns;
      return Object.fromEntries(columns.map((k) => [k, equalColumnWidth]));
    }
    const nonCollapsedWidth =
      (this.sumColumnWidth - emptyColumns.length * this.minColumnWidth) /
      (this.numberOfColumns - emptyColumns.length);

    return Object.fromEntries(
      columns.map((k) => [
        k,
        emptyColumns.includes(k) ? this.minColumnWidth : nonCollapsedWidth,
      ])
    );
  }

  expandColumn(
    currentColumnWidths: Record<string, number>,
    columnName: string
  ): Record<string, number> {
    const entries = Object.entries(currentColumnWidths).map(([col]) => {
      if (col === columnName) {
        return [col, this.maxColumnWidth];
      } else {
        return [col, this.minColumnWidth];
      }
    });
    return Object.fromEntries(entries);
  }
}
