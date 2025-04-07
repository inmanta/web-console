import { ServiceModel } from "@/Core";

export interface TablePresenter<S, T> {
  createRows(sourceData: S[], service?: ServiceModel): T[];

  getColumnHeadDisplayNames(): string[];

  getNumberOfColumns(): number;
}

export interface ColumnHead {
  apiName: string;
  displayName: string;
}
