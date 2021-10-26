import { Pagination, CompileReportParams, CompileReport } from "@/Core/Domain";

export interface GetCompileReports
  extends CompileReportParams.CompileReportParams {
  kind: "GetCompileReports";
}

export interface GetCompileReportsManifest {
  error: string;
  apiResponse: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: CompileReport[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetCompileReports;
}
