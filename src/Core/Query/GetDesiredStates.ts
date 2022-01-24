import {
  Pagination,
  DesiredStateParams,
  DesiredStateVersion,
} from "@/Core/Domain";

export interface GetDesiredStates
  extends DesiredStateParams.DesiredStateParams {
  kind: "GetDesiredStates";
}

export interface GetDesiredStatesManifest {
  error: string;
  apiResponse: {
    data: DesiredStateVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: DesiredStateVersion[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: DesiredStateVersion[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetDesiredStates;
}
