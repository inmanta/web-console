import { keepKeys } from "@/Core";
import { SearchHelper } from "./SearchHelper";

/**
 * The key under which the Compliance Check page keeps its selected report in the URL state.
 *
 * This file lives in the shared routing layer only because shared UI (ResourceActions) links to a
 * report and can't import from the Compliance Check feature. Move it into that feature once
 * features register their own routes through the FeatureModule contract.
 */
export const REPORT_URL_STATE_KEY = "report";

const searchHelper = new SearchHelper();

/**
 * Creates the search that opens a report on the Compliance Check page. It keeps only the
 * environment from the current search, not the state of the page it is opened from.
 *
 * @example createReportSearch("?env=e1&state.Resources.pageSize=50", "d1") // "?env=e1&state.ComplianceCheck.report=d1"
 */
export const createReportSearch = (search: string, dryRunId: string): string =>
  searchHelper.stringify({
    ...keepKeys(["env"], searchHelper.parse(search)),
    state: { ComplianceCheck: { [REPORT_URL_STATE_KEY]: dryRunId } },
  });
