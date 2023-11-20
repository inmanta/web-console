import { PageSize, Pagination } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { Notification, Severity } from "./Domain";
import { Origin } from "./Utils";

export interface Query {
  kind: "GetNotifications";
  filter?: Filter;
  pageSize: PageSize.PageSize;
  origin: Origin;
  currentPage: CurrentPage;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: Notification[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Notification[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Notification[];
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
  currentPage: { kind: "CurrentPage", value: [] },
};

export type ViewData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["usedData"]
>;

export type ApiData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["apiResponse"]
>;
