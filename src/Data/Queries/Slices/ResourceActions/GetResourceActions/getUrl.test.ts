import { PageSize } from "@/Core/Domain";
import { getUrl } from "./getUrl";

const pageSize: PageSize.PageSize = { kind: "PageSize", value: "20" };
const emptyPage = { kind: "CurrentPage" as const, value: "" };

describe("getUrl for resource actions", () => {
  it("builds the base URL without filters", () => {
    expect(getUrl({ pageSize, currentPage: emptyPage })).toEqual(
      "/api/v2/resource_actions?limit=20"
    );
  });

  it("appends the supported filters", () => {
    expect(
      getUrl({
        pageSize,
        currentPage: emptyPage,
        filter: {
          resource_type: "std::File",
          agent: "internal",
          value: "/tmp/a",
          log_severity: "ERROR",
        },
      })
    ).toEqual(
      "/api/v2/resource_actions?limit=20&resource_type=std%3A%3AFile&agent=internal&attribute_value=%2Ftmp%2Fa&log_severity=ERROR"
    );
  });

  it("appends the pagination cursor", () => {
    expect(
      getUrl({
        pageSize,
        currentPage: { kind: "CurrentPage", value: "last_timestamp=2026-07-23&action_id=abc" },
      })
    ).toEqual("/api/v2/resource_actions?limit=20&last_timestamp=2026-07-23&action_id=abc");
  });
});
