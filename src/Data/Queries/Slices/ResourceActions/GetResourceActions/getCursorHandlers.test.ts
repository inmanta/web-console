import { getCursorHandlers } from "./getCursorHandlers";

describe("getCursorHandlers", () => {
  it("returns empty handlers when there are no links", () => {
    expect(getCursorHandlers(undefined)).toEqual({});
  });

  it("strips the path and limit, keeping only the cursor fragment", () => {
    const handlers = getCursorHandlers({
      self: "/api/v2/resource_actions?limit=20",
      next: "/api/v2/resource_actions?limit=20&last_timestamp=2026-07-23T03%3A49%3A01&action_id=abc",
      prev: "/api/v2/resource_actions?limit=20&first_timestamp=2026-07-23T03%3A52%3A01&action_id=xyz",
    });

    expect(handlers).toEqual({
      next: "last_timestamp=2026-07-23T03%3A49%3A01&action_id=abc",
      prev: "first_timestamp=2026-07-23T03%3A52%3A01&action_id=xyz",
    });
  });

  it("returns undefined for a link with only a limit", () => {
    expect(
      getCursorHandlers({
        self: "/api/v2/resource_actions?limit=20",
        next: "/api/v2/resource_actions?limit=20",
      })
    ).toEqual({ next: undefined, prev: undefined });
  });
});
