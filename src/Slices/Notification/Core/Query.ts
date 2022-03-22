import { PageSize, Pagination } from "@/Core/Domain";
import { Model, Severity } from "./Model";

export type Origin = "drawer" | "center";

export interface Query {
  kind: "GetNotifications";
  filter?: Filter;
  pageSize: PageSize.PageSize;
  origin: Origin;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Model[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Model[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Model[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

export interface Filter {
  title?: string[];
  message?: string[];
  read?: boolean;
  cleared?: boolean;
  severity?: Severity;
}

export const drawerQuery: Query = {
  kind: "GetNotifications",
  origin: "drawer",
  pageSize: PageSize.from("100"),
  filter: { cleared: false },
};
