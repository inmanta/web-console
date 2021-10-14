import { CompileReportParams, PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  filter                                                                                                                                              | sort                                    | sortTxt             | pageSize | url
  ${undefined}                                                                                                                                        | ${undefined}                            | ${"undefined"}      | ${"20"}  | ${`/api/v2/compilereport?limit=20`}
  ${{}}                                                                                                                                               | ${undefined}                            | ${"undefined"}      | ${"10"}  | ${`/api/v2/compilereport?limit=10`}
  ${{}}                                                                                                                                               | ${{ name: "requested", order: "asc" }}  | ${"requested.asc"}  | ${"10"}  | ${`/api/v2/compilereport?limit=10&sort=requested.asc`}
  ${{}}                                                                                                                                               | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc`}
  ${{ success: true }}                                                                                                                                | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=true`}
  ${{ success: false }}                                                                                                                               | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=false`}
  ${{ status: [CompileReportParams.CompileStatus.InProgress] }}                                                                                       | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.completed=false&filter.started=true`}
  ${{ status: [CompileReportParams.CompileStatus.Finished] }}                                                                                         | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.completed=true`}
  ${{ status: [CompileReportParams.CompileStatus.Queued] }}                                                                                           | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false`}
  ${{ status: [CompileReportParams.CompileStatus.InProgress, CompileReportParams.CompileStatus.Finished] }}                                           | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=true`}
  ${{ status: [CompileReportParams.CompileStatus.InProgress, CompileReportParams.CompileStatus.Queued] }}                                             | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.completed=false`}
  ${{ status: [CompileReportParams.CompileStatus.Queued, CompileReportParams.CompileStatus.Finished] }}                                               | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false&filter.completed=true`}
  ${{ status: [CompileReportParams.CompileStatus.Queued, CompileReportParams.CompileStatus.Finished, CompileReportParams.CompileStatus.InProgress] }} | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc`}
`(
  "getUrl returns correct url for compile reports with sort: $sortTxt, filter $filter, and pageSize: $pageSize",
  ({ filter, sort, pageSize, url }) => {
    const query: Query.SubQuery<"CompileReports"> = {
      kind: "CompileReports",
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
    };
    expect(getUrl(query, "Europe/Brussels")).toEqual(url);
  }
);
