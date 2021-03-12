export interface TablePresenter<S, T> {
  createRows(sourceData: S[]): T[];

  getColumnHeads(): string[];

  getNumberOfColumns(): number;
}
