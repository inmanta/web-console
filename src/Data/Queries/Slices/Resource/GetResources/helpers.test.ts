import { describe, it, expect } from "vitest";
import { mapStatusToGraphQLFilter, mapSort, parseCurrentPage, buildHandlers } from "./helpers";

// ─── mapStatusToGraphQLFilter ───────────────────────────────────────────────

describe("mapStatusToGraphQLFilter", () => {
  it("returns empty object when status is undefined", () => {
    const result = mapStatusToGraphQLFilter(undefined);

    expect(result).toEqual({});
  });

  it("returns empty object when status is an empty array", () => {
    const result = mapStatusToGraphQLFilter([]);

    expect(result).toEqual({});
  });

  it("maps 'orphaned' to isOrphan: true", () => {
    const result = mapStatusToGraphQLFilter(["orphaned"]);

    expect(result).toEqual({ isOrphan: true });
  });

  it("maps '!orphaned' to isOrphan: false", () => {
    const result = mapStatusToGraphQLFilter(["!orphaned"]);

    expect(result).toEqual({ isOrphan: false });
  });

  it("maps 'purged' to purged: true", () => {
    const result = mapStatusToGraphQLFilter(["purged"]);

    expect(result).toEqual({ purged: true });
  });

  it("maps lastHandlerRun statuses correctly", () => {
    const result = mapStatusToGraphQLFilter(["failed", "skipped"]);

    expect(result).toEqual({
      lastHandlerRun: { eq: ["FAILED", "SKIPPED"] },
    });
  });

  it("maps compliance statuses correctly", () => {
    const result = mapStatusToGraphQLFilter(["compliant", "non_compliant"]);

    expect(result).toEqual({
      compliance: { eq: ["COMPLIANT", "NON_COMPLIANT"] },
    });
  });

  it("maps blocked statuses correctly", () => {
    const result = mapStatusToGraphQLFilter(["blocked", "temporarily_blocked"]);

    expect(result).toEqual({
      blocked: { eq: ["BLOCKED", "TEMPORARILY_BLOCKED"] },
    });
  });

  it("handles a mix of compound states across multiple fields", () => {
    const result = mapStatusToGraphQLFilter(["failed", "compliant", "not_blocked"]);

    expect(result).toEqual({
      lastHandlerRun: { eq: ["FAILED"] },
      compliance: { eq: ["COMPLIANT"] },
      blocked: { eq: ["NOT_BLOCKED"] },
    });
  });

  it("silently ignores unknown status values", () => {
    const result = mapStatusToGraphQLFilter(["unknown_status"]);

    expect(result).toEqual({});
  });

  it("handles all statuses together without collisions", () => {
    const result = mapStatusToGraphQLFilter([
      "orphaned",
      "purged",
      "failed",
      "compliant",
      "blocked",
    ]);

    expect(result).toEqual({
      isOrphan: true,
      purged: true,
      lastHandlerRun: { eq: ["FAILED"] },
      compliance: { eq: ["COMPLIANT"] },
      blocked: { eq: ["BLOCKED"] },
    });
  });
});

// ─── mapSort ────────────────────────────────────────────────────────────────

describe("mapSort", () => {
  it("returns undefined when sort is undefined", () => {
    const result = mapSort(undefined);

    expect(result).toBeUndefined();
  });

  it("maps a sort object to the GraphQL orderBy format", () => {
    const result = mapSort({ name: "resource_type", order: "asc" });

    expect(result).toEqual([{ key: "resource_type", order: "asc" }]);
  });

  it("maps descending sort correctly", () => {
    const result = mapSort({ name: "agent", order: "desc" });

    expect(result).toEqual([{ key: "agent", order: "desc" }]);
  });
});

// ─── parseCurrentPage ───────────────────────────────────────────────────────

describe("parseCurrentPage", () => {
  it("returns empty values for an empty currentPage value", () => {
    const result = parseCurrentPage({ kind: "CurrentPage", value: "" });

    expect(result).toEqual({
      after: undefined,
      before: undefined,
      beforeCount: 0,
    });
  });

  it("parses a forward pagination cursor correctly", () => {
    const result = parseCurrentPage({
      kind: "CurrentPage",
      value: "after=someCursor&beforeCount=50",
    });

    expect(result).toEqual({
      after: "someCursor",
      before: undefined,
      beforeCount: 50,
    });
  });

  it("parses a backward pagination cursor correctly", () => {
    const result = parseCurrentPage({
      kind: "CurrentPage",
      value: "before=someCursor&beforeCount=50",
    });

    expect(result).toEqual({
      after: undefined,
      before: "someCursor",
      beforeCount: 50,
    });
  });

  it("defaults beforeCount to 0 when not present", () => {
    const result = parseCurrentPage({ kind: "CurrentPage", value: "after=someCursor" });

    expect(result.beforeCount).toBe(0);
  });

  it("decodes a percent-encoded base64 cursor correctly", () => {
    const cursor = "abc+def==";
    const value = `after=${encodeURIComponent(cursor)}&beforeCount=10`;
    const result = parseCurrentPage({ kind: "CurrentPage", value });

    expect(result.after).toBe(cursor);
  });
});

// ─── buildHandlers ──────────────────────────────────────────────────────────

describe("buildHandlers", () => {
  it("returns undefined for both handlers when there are no adjacent pages", () => {
    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      endCursor: null,
      startCursor: null,
    };
    const result = buildHandlers(pageInfo, 0, 50);

    expect(result).toEqual({ next: undefined, prev: undefined });
  });

  it("builds a next handler when hasNextPage is true", () => {
    const pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      endCursor: "endCursor123",
      startCursor: null,
    };
    const { next } = buildHandlers(pageInfo, 0, 50);
    const params = new URLSearchParams(next!);

    expect(params.get("after")).toBe("endCursor123");
    expect(params.get("beforeCount")).toBe("50");
  });

  it("builds a prev handler when hasPreviousPage is true", () => {
    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: true,
      endCursor: null,
      startCursor: "startCursor123",
    };
    const { prev } = buildHandlers(pageInfo, 50, 50);
    const params = new URLSearchParams(prev!);

    expect(params.get("before")).toBe("startCursor123");
    expect(params.get("beforeCount")).toBe("0");
  });

  it("does not produce a next handler when endCursor is null", () => {
    const pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      endCursor: null,
      startCursor: null,
    };
    const { next } = buildHandlers(pageInfo, 0, 50);

    expect(next).toBeUndefined();
  });

  it("does not produce a prev handler when startCursor is null", () => {
    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: true,
      endCursor: null,
      startCursor: null,
    };
    const { prev } = buildHandlers(pageInfo, 50, 50);

    expect(prev).toBeUndefined();
  });

  it("clamps prevBeforeCount to 0 when currentBeforeCount is less than pageSize", () => {
    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: true,
      endCursor: null,
      startCursor: "startCursor",
    };
    const { prev } = buildHandlers(pageInfo, 10, 50);
    const params = new URLSearchParams(prev!);

    expect(params.get("beforeCount")).toBe("0");
  });

  it("encodes cursors containing base64 special characters", () => {
    const cursor = "abc+def/ghi==";
    const pageInfo = {
      hasNextPage: true,
      hasPreviousPage: true,
      endCursor: cursor,
      startCursor: cursor,
    };
    const { next, prev } = buildHandlers(pageInfo, 50, 50);

    expect(new URLSearchParams(next!).get("after")).toBe(cursor);
    expect(new URLSearchParams(prev!).get("before")).toBe(cursor);
  });
});
