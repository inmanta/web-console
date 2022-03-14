import { CompileStatus, PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

test.each`
  filter                                  | sort                                    | sortTxt             | pageSize | url
  ${undefined}                            | ${undefined}                            | ${"undefined"}      | ${"20"}  | ${`/api/v2/compilereport?limit=20`}
  ${{}}                                   | ${undefined}                            | ${"undefined"}      | ${"10"}  | ${`/api/v2/compilereport?limit=10`}
  ${{}}                                   | ${{ name: "requested", order: "asc" }}  | ${"requested.asc"}  | ${"10"}  | ${`/api/v2/compilereport?limit=10&sort=requested.asc`}
  ${{}}                                   | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc`}
  ${{ status: CompileStatus.Success }}    | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=true`}
  ${{ status: CompileStatus.Failed }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=false`}
  ${{ status: CompileStatus.InProgress }} | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=true&filter.completed=false`}
  ${{ status: CompileStatus.Queued }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false`}
`(
  "getUrl returns correct url for compile reports with sort: $sortTxt, filter $filter, and pageSize: $pageSize",
  ({ filter, sort, pageSize, url }) => {
    const query: Query.SubQuery<"GetCompileReports"> = {
      kind: "GetCompileReports",
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
    };
    expect(getUrl(query, "Europe/Brussels")).toEqual(url);
  }
);
