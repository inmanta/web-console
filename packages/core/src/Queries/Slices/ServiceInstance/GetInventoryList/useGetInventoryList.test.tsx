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
 * Serves a service's inventory in pages of `limit`, with `links.next` on every page but the last,
 * and records the query of each request.
 */
const servePages = (service: string, all: ServiceInstanceModel[], requests: string[]) =>
  http.get(`/lsm/v1/service_inventory/${service}`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const limit = Number(params.get("limit"));
    const start = Number(params.get("start") ?? 0);
    const end = start + limit;

    requests.push(params.toString());

    return HttpResponse.json({
      data: all.slice(start, end),
      links: {
        self: `/lsm/v1/service_inventory/${service}?${params}`,
        ...(end < all.length
          ? { next: `/lsm/v1/service_inventory/${service}?limit=${limit}&start=${end}` }
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
    expect(requests).toEqual(["limit=1000", "limit=1000&start=1000"]);
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
