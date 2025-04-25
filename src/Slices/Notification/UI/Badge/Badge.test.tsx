import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { DeferredApiHelper, MockedDependencyProvider } from "@/Test";
import { metadata, links } from "@/Test/Data/Pagination";
import * as Mock from "@S/Notification/Core/Mock";
import { Badge } from "./Badge";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        <MockedDependencyProvider>
          <Badge onClick={() => undefined} />
        </MockedDependencyProvider>
      </StoreProvider>
    </QueryClientProvider>
  );

  return { component, apiHelper };
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
      const { component } = setup();

      render(component);

      const button = await screen.findByRole("button", {
        name: "Badge-Success",
      });

      expect(button).toBeVisible();
      expect(button).toHaveAttribute("data-variant", variant);
    }
  );

  test("Given Badge WHEN request is loading THEN variant is not shown and badge is disabled", () => {
    server.use(
      http.get("/api/v2/notification", () => {
        delay(100);

        return HttpResponse.json({ data: [], links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    const badge = screen.getByRole("button", { name: "Badge" });

    expect(badge).toBeVisible();
    expect(badge).toBeDisabled();
    expect(badge).not.toHaveAttribute("data-variant");
  });
});
