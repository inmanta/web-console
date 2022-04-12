import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as Mock from "@S/Notification/Core/Mock";
import { Badge } from "./Badge";

function setup() {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();

  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );

  const component = (
    <StoreProvider store={store}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <Badge onClick={() => undefined} />
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper };
}

test("Given Badge WHEN request fails THEN error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);
  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=100&filter.cleared=false",
    },
  ]);
  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });
  expect(
    screen.getByRole("generic", { name: "ErrorToastAlert" })
  ).toBeVisible();
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
    const { component, apiHelper } = setup();
    render(component);
    expect(apiHelper.pendingRequests).toEqual([
      {
        method: "GET",
        environment: "env",
        url: "/api/v2/notification?limit=100&filter.cleared=false",
      },
    ]);
    await act(async () => {
      await apiHelper.resolve(Either.right({ ...Mock.response, data }));
    });
    const button = screen.getByRole("button", { name: "Badge" });
    expect(button).toBeVisible();
    expect(button).toHaveAttribute("data-variant", variant);
  }
);
