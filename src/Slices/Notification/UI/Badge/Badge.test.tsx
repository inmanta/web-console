import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { metadata, links } from "@/Test/Data/Pagination";
import * as Mock from "@S/Notification/Core/Mock";
import { Badge } from "./Badge";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const component = (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider>
        <Badge onClick={() => undefined} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component, queryClient };
}
const server = setupServer();

describe("Badge", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("Given Badge WHEN request fails THEN error is shown", async () => {
    server.use(
      http.get("/api/v2/notification", () => {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("ToastAlert")).toBeVisible();
  });

  test.each`
    data                                    | condition                  | variant
    ${[Mock.read]}                          | ${"only read"}             | ${"read"}
    ${[Mock.unread]}                        | ${"an unread"}             | ${"unread"}
    ${[Mock.unread, Mock.read]}             | ${"unread + read"}         | ${"unread"}
    ${[Mock.error]}                         | ${"an unread error"}       | ${"attention"}
    ${[Mock.error, Mock.unread, Mock.read]} | ${"error + unread + read"} | ${"attention"}
  `(
    "Given Badge WHEN notifications contain $condition THEN $variant variant is shown",
    async ({ data, variant }) => {
      server.use(
        http.get("/api/v2/notification", () => {
          return HttpResponse.json({ data, links, metadata });
        })
      );
      const { component, queryClient } = setup();

      render(component);

      const button = await screen.findByRole("button", {
        name: "Badge-Success",
      });

      expect(button).toBeVisible();
      // Wait for the query to settle first — otherwise the `read` rows pass on the
      // identical loading default before the response is processed.
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      await waitFor(() => expect(button).toHaveAttribute("data-variant", variant));
    }
  );

  test("Given Badge WHEN request is loading THEN an enabled read badge is shown", () => {
    server.use(
      http.get("/api/v2/notification", () => {
        return HttpResponse.json({ data: [], links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    const badge = screen.getByRole("button", { name: "Badge-Success" });

    expect(badge).toBeVisible();
    expect(badge).toBeEnabled();
    expect(badge).toHaveAttribute("data-variant", "read");
  });
});
