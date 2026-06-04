import { PageSize } from "@/Core";
import { AgentStatus } from "@S/Agents/Core/Domain";
import { getUrl } from "./getUrl";
import { GetAgentsParams } from "./useGetAgents";

interface Case {
  name: string;
  filter?: GetAgentsParams["filter"];
  sort?: GetAgentsParams["sort"];
  pageSize: string;
  currentPage?: string;
  cursor?: string;
  expected: string;
}

const cases: Case[] = [
  {
    name: "basic request",
    pageSize: "20",
    expected: "/api/v2/agents?limit=20",
  },
  {
    name: "with sort asc",
    pageSize: "50",
    sort: { name: "name", order: "asc" },
    expected: "/api/v2/agents?limit=50&sort=name.asc",
  },
  {
    name: "with sort desc",
    pageSize: "20",
    sort: { name: "name", order: "desc" },
    expected: "/api/v2/agents?limit=20&sort=name.desc",
  },
  {
    name: "filter by name",
    pageSize: "20",
    filter: { name: ["agent1"] },
    sort: { name: "name", order: "desc" },
    expected: "/api/v2/agents?limit=20&filter.name=agent1&sort=name.desc",
  },
  {
    name: "multiple filters",
    pageSize: "20",
    filter: { name: ["agent1"], process_name: ["proc1", "proc2"] },
    sort: { name: "name", order: "desc" },
    expected:
      "/api/v2/agents?limit=20&filter.name=agent1&filter.process_name=proc1&filter.process_name=proc2&sort=name.desc",
  },
  {
    name: "status filter",
    pageSize: "20",
    filter: { status: [AgentStatus.up] },
    sort: { name: "name", order: "desc" },
    expected: "/api/v2/agents?limit=20&filter.status=up&sort=name.desc",
  },
  {
    name: "currentPage pagination",
    pageSize: "20",
    filter: { status: [AgentStatus.up] },
    sort: { name: "name", order: "desc" },
    currentPage: "start=2023-12-13T08%3A33%3A15.180818%2B00%3A00",
    expected:
      "/api/v2/agents?limit=20&filter.status=up&sort=name.desc&start=2023-12-13T08%3A33%3A15.180818%2B00%3A00",
  },
  {
    name: "cursor overrides currentPage",
    pageSize: "20",
    filter: { status: [AgentStatus.up] },
    sort: { name: "name", order: "desc" },
    currentPage: "start=should-not-appear",
    cursor: "cursor123",
    expected: "/api/v2/agents?limit=20&filter.status=up&sort=name.desc&start=cursor123",
  },
];

describe("getUrl", () => {
  it.each(cases)("$name", ({ filter, sort, pageSize, currentPage, cursor, expected }) => {
    const query: GetAgentsParams = {
      pageSize: PageSize.from(pageSize),
      filter,
      sort,
      currentPage: { kind: "CurrentPage", value: currentPage ?? "" },
    };

    expect(getUrl(query, cursor)).toEqual(expected);
  });
});
