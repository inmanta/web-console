import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandManagerResolver,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as Mock from "@S/Notification/Core/Mock";
import { Page } from "./Page";

const setup = () => {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, new KeycloakAuthHelper())
  );

  const component = (
    <MemoryRouter>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Page />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
};

test("Given Notification Center page Then fetches notifications", async () => {
  const { component, apiHelper } = setup();
  render(component);
  expect(apiHelper.pendingRequests).toEqual([
    { method: "GET", environment: "env", url: "/api/v2/notification?limit=20" },
  ]);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });
});

test.todo(
  "Given Notification Center page When user filters on severity Then executes correct request"
);

test.todo(
  "Given Notification Center page When user filters on title Then executes correct request"
);

test.todo(
  "Given Notification Center page When user filters on message Then executes correct request"
);

test.todo(
  "Given Notification Center page When user filters on read Then executes correct request"
);

test.todo(
  "Given Notification Center page When user selects 2nd page Then fetches 2nd page"
);
