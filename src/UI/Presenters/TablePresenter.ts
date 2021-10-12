export interface TablePresenter<S, T> {
  createRows(sourceData: S[]): T[];

  getColumnHeadDisplayNames(): string[];

  getNumberOfColumns(): number;
}
export interface ColumnHead {
  apiName: string;
  displayName: string;
}
