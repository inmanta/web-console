import { DateRange } from "./DateRange";
import { PageSize } from "./PageSize";
import { Sort } from "./Sort";

export interface ParametersQueryParams {
  filter?: Filter;
  sort?: Sort;
  pageSize: PageSize;
}

export interface Filter {
  name?: string[];
  source?: string[];
  updated?: DateRange[];
}

export enum Kind {
  Name = "Name",
  Source = "Source",
  Updated = "Updated",
}

export const List: Kind[] = [Kind.Name, Kind.Source, Kind.Updated];
