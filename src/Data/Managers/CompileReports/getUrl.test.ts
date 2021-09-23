import { PageSize, Query } from "@/Core";
import { getUrl } from "./getUrl";

it.each`
  sort                                    | sortTxt             | pageSize | url
  ${undefined}                            | ${"undefined"}      | ${20}    | ${`/api/v2/compilereport?limit=20`}
  ${undefined}                            | ${"undefined"}      | ${10}    | ${`/api/v2/compilereport?limit=10`}
  ${{ name: "requested", order: "asc" }}  | ${"requested.asc"}  | ${10}    | ${`/api/v2/compilereport?limit=10&sort=requested.asc`}
  ${{ name: "requested", order: "desc" }} | ${"requested.desc"} | ${20}    | ${`/api/v2/compilereport?limit=20&sort=requested.desc`}
`(
  "getUrl returns correct url for compile reports with sort: $sortTxt and pageSize: $pageSize",
  ({ sort, pageSize, url }) => {
    const query: Query.SubQuery<"CompileReports"> = {
      kind: "CompileReports",
      pageSize: PageSize.from(pageSize),
      sort,
    };
    expect(getUrl(query)).toEqual(url);
  }
);
