import { PageSize } from "./PageSize";
import { Sort } from "./Params";

export interface CompileReportParams {
  sort?: Sort;
  pageSize: PageSize;
}
