import { Pagination, ParametersQueryParams, Parameter } from "@/Core/Domain";

export interface GetParameters
  extends ParametersQueryParams.ParametersQueryParams {
  kind: "GetParameters";
}

export interface GetParametersManifest {
  error: string;
  apiResponse: {
    data: Parameter[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Parameter[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Parameter[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetParameters;
}
