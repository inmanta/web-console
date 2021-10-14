import { ResourceStatus } from "./Resource";
import { Sort } from "./Sort";
import { PageSize } from "./PageSize";

export interface ResourceParams {
  sort?: Sort;
  filter?: Filter;
  pageSize: PageSize;
}

export interface Filter {
  type?: string[];
  agent?: string[];
  value?: string[];
  status?: ResourceStatus[];
}

export enum Kind {
  Type = "Type",
  Agent = "Agent",
  Value = "Value",
  Status = "Status",
}
export const List: Kind[] = [Kind.Status, Kind.Type, Kind.Agent, Kind.Value];
