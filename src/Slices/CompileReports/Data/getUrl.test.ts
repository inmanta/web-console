import { CompileStatus, PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

test.each`
  filter                                  | sort                                    | sortTxt             | pageSize | currentPage                                                 | url
  ${undefined}                            | ${undefined}                            | ${"undefined"}      | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20`}
  ${{}}                                   | ${undefined}                            | ${"undefined"}      | ${"50"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=50`}
  ${{}}                                   | ${{ name: "requested", order: "asc" }}  | ${"requested.asc"}  | ${"50"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=50&sort=requested.asc`}
  ${{}}                                   | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20&sort=requested.desc`}
  ${{ status: CompileStatus.success }}    | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=true`}
  ${{ status: CompileStatus.failed }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=false`}
  ${{ status: CompileStatus.inprogress }} | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=true&filter.completed=false`}
  ${{ status: CompileStatus.queued }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${""}                                                       | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false`}
  ${{ status: CompileStatus.queued }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${"end%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00"} | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false&end%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00`}
  ${{ status: CompileStatus.queued }}     | ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"}         | ${`/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=false&"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"`}
`(
  "getUrl returns correct url for compile reports with sort: $sortTxt, filter $filter, currentPage: $currentPage: and pageSize: $pageSize",
  ({ filter, sort, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetCompileReports"> = {
      kind: "GetCompileReports",
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query, "Europe/Brussels")).toEqual(url);
  },
);
