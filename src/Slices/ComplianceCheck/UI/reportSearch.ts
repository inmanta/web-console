import { keepKeys } from "@/Core";
import { SearchHelper } from "@/UI/Routing/SearchHelper";

/**
 * The key under which the Compliance Check page keeps its selected report in the URL state.
 */
export const REPORT_URL_STATE_KEY = "report";

const searchHelper = new SearchHelper();

/**
 * The search that opens a report on the Compliance Check page. It keeps only the environment from
 * the current search, not the state of the page it is opened from.
 *
 * @example getReportSearch("?env=e1&state.Resources.pageSize=50", "d1") // "?env=e1&state.ComplianceCheck.report=d1"
 */
export const getReportSearch = (search: string, dryRunId: string): string =>
  searchHelper.stringify({
    ...keepKeys(["env"], searchHelper.parse(search)),
    state: { ComplianceCheck: { [REPORT_URL_STATE_KEY]: dryRunId } },
  });
