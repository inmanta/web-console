import { AgentStatus } from "./AgentStatus";
import { PageSize } from "./PageSize";
import { Sort } from "./Sort";

export interface AgentParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}

export enum Kind {
  Name = "Name",
  ProcessName = "Process Name",
  Status = "Status",
}

export const List: Kind[] = [Kind.Name, Kind.ProcessName, Kind.Status];
