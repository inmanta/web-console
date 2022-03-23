import { PageSize, Pagination } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";
import { Model, Severity } from "./Model";
import { Origin } from "./Utils";

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

export type ViewData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["usedData"]
>;

export type ApiData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["apiResponse"]
>;
