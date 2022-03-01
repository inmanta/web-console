export class ColumnExpansionHelper {
  private readonly expandedColumnResetLimit: number = 2;
  private readonly maxColumnWidth: number;
  private readonly equalColumnWidth: number;

  /** Supports at most 1 expanded and (numberOfColumns - 1) collapsed columns
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
    this.sumColumnWidth = sumColumnWidth;
    this.maxColumnWidth =
      sumColumnWidth - (numberOfColumns - 1) * minColumnWidth;
    this.minColumnWidth = minColumnWidth;
    this.equalColumnWidth = sumColumnWidth / numberOfColumns;
  }

  getMinColumnWidth(): number {
    return this.minColumnWidth;
  }

  getMaxColumnWidth(): number {
    return this.maxColumnWidth;
  }

  getDefaultState(columns: string[]): Record<string, number> {
    const defaultValues = Array(columns.length).fill(this.equalColumnWidth);
    return Object.fromEntries(columns.map((k, i) => [k, defaultValues[i]]));
  }

  collapseColumn(
    currentColumnWidths: Record<string, number>,
    columnName: string
  ): Record<string, number> {
    return this.setColumnSize(
      currentColumnWidths,
      columnName,
      this.minColumnWidth,
      this.numberOfColumns
    );
  }

  expandColumn(
    currentColumnWidths: Record<string, number>,
    columnName: string
  ): Record<string, number> {
    return this.setColumnSize(
      currentColumnWidths,
      columnName,
      this.maxColumnWidth,
      this.expandedColumnResetLimit
    );
  }

  private setColumnSize(
    currentColumnWidths: Record<string, number>,
    columnName: string,
    columnSize: number,
    resetColumnLimit: number
  ): Record<string, number> {
    const base = { ...currentColumnWidths };
    base[columnName] = columnSize;
    const numberOfColumnsWithSetWidths = Object.entries(base).filter(
      ([, width]) => width === columnSize
    ).length;
    const entries = Object.entries(base).map(([col, width]) => {
      if (resetColumnLimit === numberOfColumnsWithSetWidths) {
        return [col, this.equalColumnWidth];
      }
      if (width === columnSize) {
        return [col, width];
      }
      return [
        col,
        (this.sumColumnWidth - numberOfColumnsWithSetWidths * columnSize) /
          Math.max(this.numberOfColumns - numberOfColumnsWithSetWidths, 1),
      ];
    });
    return Object.fromEntries(entries);
  }
}
