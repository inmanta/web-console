import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NotificationsResponse } from "@/Data/Queries";
import { MockedDependencyProvider } from "@/Test";
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
  const queryBase = graphql.link("/api/v2/graphql");

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test.each`
    data                                                                  | condition                  | variant
    ${[]}                                                                 | ${"no notifications"}      | ${"read"}
    ${[{ node: Mock.read }]}                                              | ${"only read"}             | ${"read"}
    ${[{ node: Mock.unread }]}                                            | ${"an unread"}             | ${"unread"}
    ${[{ node: Mock.unread }, { node: Mock.read }]}                       | ${"unread + read"}         | ${"unread"}
    ${[{ node: Mock.error }]}                                             | ${"an unread error"}       | ${"attention"}
    ${[{ node: Mock.error }, { node: Mock.unread }, { node: Mock.read }]} | ${"error + unread + read"} | ${"attention"}
  `(
    "Given Badge WHEN notifications contain $condition THEN $variant variant is shown",
    async ({ data, variant }) => {
      server.use(
        queryBase.operation(() => {
          return HttpResponse.json<{ data: NotificationsResponse }>({
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
      queryBase.operation(() =>
        HttpResponse.json<{ data: NotificationsResponse }>({
          data: { data: { notifications: { edges: [] } }, errors: [], extensions: {} },
        })
      )
    );
    const { component } = setup();
    render(component);

    const badge = screen.getByRole("button", { name: "Badge-Success" });
    expect(badge).toBeVisible();
    expect(badge).toBeEnabled();
    expect(badge).toHaveAttribute("data-variant", "read");
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
