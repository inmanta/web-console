import { PageSize, Query } from "@/Core";
import { AgentStatus } from "@S/Agents/Core/Domain";
import { getUrl } from "./getUrl";

it.each`
  filter                                                    | sort                               | sortTxt        | pageSize | currentPage                                                  | url
  ${undefined}                                              | ${undefined}                       | ${"undefined"} | ${"20"}  | ${""}                                                        | ${`/api/v2/agents?limit=20`}
  ${{}}                                                     | ${undefined}                       | ${"undefined"} | ${"50"}  | ${""}                                                        | ${`/api/v2/agents?limit=50`}
  ${{}}                                                     | ${{ name: "name", order: "asc" }}  | ${"name.asc"}  | ${"50"}  | ${""}                                                        | ${`/api/v2/agents?limit=50&sort=name.asc`}
  ${{}}                                                     | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${""}                                                        | ${`/api/v2/agents?limit=20&sort=name.desc`}
  ${{ name: ["agent1"] }}                                   | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${""}                                                        | ${`/api/v2/agents?limit=20&filter.name=agent1&sort=name.desc`}
  ${{ name: ["agent1"], process_name: ["proc1", "proc2"] }} | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${""}                                                        | ${`/api/v2/agents?limit=20&filter.name=agent1&filter.process_name=proc1&filter.process_name=proc2&sort=name.desc`}
  ${{ status: [AgentStatus.up] }}                           | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${""}                                                        | ${`/api/v2/agents?limit=20&filter.status=up&sort=name.desc`}
  ${{ status: [AgentStatus.up] }}                           | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${"end=%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00"} | ${`/api/v2/agents?limit=20&filter.status=up&sort=name.desc&end=%3D2023-12-13T08%253A33%253A15.192674%252B00%253A00`}
  ${{ status: [AgentStatus.up] }}                           | ${{ name: "name", order: "desc" }} | ${"name.desc"} | ${"20"}  | ${"start=2023-12-13T08%3A33%3A15.180818%2B00%3A00"}          | ${`/api/v2/agents?limit=20&filter.status=up&sort=name.desc&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00`}
`(
  "getUrl returns correct url for agents with sort: $sortTxt, filter $filter, and pageSize: $pageSize",
  ({ filter, sort, pageSize, url, currentPage }) => {
    const query: Query.SubQuery<"GetAgents"> = {
      kind: "GetAgents",
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage },
    };
    expect(getUrl(query)).toEqual(url);
  },
);
