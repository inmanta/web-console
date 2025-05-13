import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { delay, graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NotificationQLResponse } from "@/Data/Managers/V2/Notification/GetNotificationsQL/useGetNotificationQL";
import { DeferredApiHelper, MockedDependencyProvider } from "@/Test";
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

  const component = (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider>
        <Badge onClick={() => undefined} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component, apiHelper };
}
const server = setupServer();

describe("Badge", () => {
  const queryBase = graphql.link("/api/v2/graphql");

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test.each`
    data                                          | condition                  | variant
    ${[]}                                         | ${"no notifications"}      | ${"read"}
    ${[Mock.readQL]}                              | ${"only read"}             | ${"read"}
    ${[Mock.unreadQL]}                            | ${"an unread"}             | ${"unread"}
    ${[Mock.unreadQL, Mock.readQL]}               | ${"unread + read"}         | ${"unread"}
    ${[Mock.errorQL]}                             | ${"an unread error"}       | ${"attention"}
    ${[Mock.errorQL, Mock.unreadQL, Mock.readQL]} | ${"error + unread + read"} | ${"attention"}
  `(
    "Given Badge WHEN notifications contain $condition THEN $variant variant is shown",
    async ({ data, variant }) => {
      server.use(
        queryBase.operation(() => {
          return HttpResponse.json<{ data: NotificationQLResponse }>({
            data: {
              data: {
                notifications: {
                  edges: data,
                },
              },
              errors: [],
              extensions: {},
            },
          });
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
      queryBase.operation(() => {
        delay(100);

        return HttpResponse.json<{ data: NotificationQLResponse }>({
          data: {
            data: {
              notifications: {
                edges: [],
              },
            },
            errors: [],
            extensions: {},
          },
        });
      })
    );
    const { component } = setup();

    render(component);

    const badge = screen.getByRole("button", { name: "Badge" });

    expect(badge).toBeVisible();
    expect(badge).toBeDisabled();
    expect(badge).not.toHaveAttribute("data-variant");
  });
  test("Given Badge WHEN request fails THEN error is shown", async () => {
    server.use(
      queryBase.operation(() => {
        return HttpResponse.json({ errors: ["error"] }, { status: 500 });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("ToastAlert")).toBeVisible();
  });

  test("Given Badge WHEN request succeeds but experienced query language error THEN error is shown", async () => {
    server.use(
      queryBase.operation(() => {
        return HttpResponse.json({ data: null, errors: ["error"] }, { status: 200 });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByTestId("ToastAlert")).toBeVisible();
  });
});
