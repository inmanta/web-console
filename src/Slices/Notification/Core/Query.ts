import { PageSize, Pagination } from "@/Core/Domain";
import * as Notification from "./Model";

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
    data: Notification.Model[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Notification.Model[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Notification.Model[];
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
  severity?: boolean;
}
