import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { ServiceInstanceModel } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import * as ServiceInstance from "@inmanta/web-console-test-utils/Data/ServiceInstance";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { useGetInventoryList } from "./useGetInventoryList";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

const instances = (service: string, count: number, from = 0): ServiceInstanceModel[] =>
  Array.from({ length: count }, (_, index) => ({
    ...ServiceInstance.a,
    id: `${service}-${from + index}`,
    service_entity: service,
  }));

/**
 * The query of the API's `links.next` after the given instance: a cursor of the last instance's
 * position and id, with the sort and filters of the first page.
 */
const nextQuery = (limit: number, position: number, lastId: string) =>
  `limit=${limit}&sort=created_at.DESC&include_deleted=False&filter.deleted=False&end=${position}&last_instance_id=${lastId}`;

/**
 * Serves a service's inventory in pages of `limit`, with `links.next` on every page but the last,
 * and records the query of each request.
 */
const servePages = (service: string, all: ServiceInstanceModel[], requests: string[]) =>
  http.get(`/lsm/v1/service_inventory/${service}`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit"));
    const lastId = url.searchParams.get("last_instance_id");
    const start = lastId ? all.findIndex(({ id }) => id === lastId) + 1 : 0;
    const page = all.slice(start, start + limit);

    requests.push(url.search.slice(1));

    return HttpResponse.json({
      data: page,
      links: {
        self: `/lsm/v1/service_inventory/${service}${url.search}`,
        ...(start + limit < all.length
          ? {
              next: `/lsm/v1/service_inventory/${service}?${nextQuery(limit, start + limit, page[page.length - 1].id)}`,
            }
          : {}),
      },
    });
  });

describe("useGetInventoryList", () => {
  const server = setupTestServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN a service with more instances than fit in a page THEN it fetches every page", async () => {
    const all = instances("big-service", 1001);
    const requests: string[] = [];

    server.use(servePages("big-service", all, requests));

    const { result } = renderHook(() => useGetInventoryList(["big-service"]).useOneTime(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.["big-service"]).toHaveLength(1001);
    // The one instance on the second page
    expect(result.current.data?.["big-service"][1000].id).toBe("big-service-1000");
    // The second request is the whole query of links.next
    expect(requests).toEqual(["limit=1000", nextQuery(1000, 1000, "big-service-999")]);
  });

  test("GIVEN several services THEN it keeps the instances of each under its own name", async () => {
    const requests: string[] = [];

    server.use(
      servePages("service-a", instances("service-a", 1002), requests),
      servePages("service-b", instances("service-b", 2), requests)
    );

    const { result } = renderHook(
      () => useGetInventoryList(["service-a", "service-b"]).useOneTime(),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.["service-a"]).toHaveLength(1002);
    expect(result.current.data?.["service-b"].map(({ id }) => id)).toEqual([
      "service-b-0",
      "service-b-1",
    ]);
    // Two pages for service-a, one for service-b
    expect(requests).toHaveLength(3);
  });

  test("GIVEN a next link that repeats the page THEN it stops instead of fetching it again", async () => {
    const requests: string[] = [];

    server.use(
      http.get("/lsm/v1/service_inventory/looping-service", ({ request }) => {
        requests.push(new URL(request.url).search);

        return HttpResponse.json({
          data: instances("looping-service", 2),
          links: { self: "", next: "/lsm/v1/service_inventory/looping-service?end=same" },
        });
      })
    );

    const { result } = renderHook(() => useGetInventoryList(["looping-service"]).useOneTime(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requests).toEqual(["?limit=1000", "?end=same"]);
  });

  test("GIVEN a response without links THEN it stops after that page", async () => {
    const requests: string[] = [];

    server.use(
      http.get("/lsm/v1/service_inventory/plain-service", ({ request }) => {
        requests.push(new URL(request.url).search);

        return HttpResponse.json({ data: instances("plain-service", 3) });
      })
    );

    const { result } = renderHook(() => useGetInventoryList(["plain-service"]).useOneTime(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.["plain-service"]).toHaveLength(3);
    expect(requests).toHaveLength(1);
  });
});
