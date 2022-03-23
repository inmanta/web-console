import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  const items = screen.getAllByRole("listitem", {
    name: "NotificationItem",
  });
  expect(items).toHaveLength(3);
});

test("Given Notification Center page When user filters on severity Then executes correct request", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  userEvent.click(screen.getByRole("button", { name: "Severity" }));
  userEvent.click(screen.getByRole("option", { name: "message" }));

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20&filter.severity=message",
    },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] })
    );
  });

  const items = screen.getAllByRole("listitem", {
    name: "NotificationItem",
  });
  expect(items).toHaveLength(2);

  userEvent.click(screen.getByRole("button", { name: "Severity" }));
  userEvent.click(screen.getByRole("option", { name: "message" }));

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20",
    },
  ]);
});

test("Given Notification Center page When user filters on read Then executes correct request", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  userEvent.click(screen.getByRole("button", { name: "Read" }));
  userEvent.click(screen.getByRole("option", { name: "read" }));

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20&filter.read=true",
    },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] })
    );
  });

  const items = screen.getAllByRole("listitem", {
    name: "NotificationItem",
  });
  expect(items).toHaveLength(2);

  userEvent.click(screen.getByRole("button", { name: "Read" }));
  userEvent.click(screen.getByRole("option", { name: "read" }));
  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20",
    },
  ]);
});

test("Given Notification Center page When user filters on message Then executes correct request", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const input = screen.getByRole("searchbox", { name: "MessageFilter" });
  userEvent.type(input, "abc{enter}");

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20&filter.message=abc",
    },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] })
    );
  });

  const items = screen.getAllByRole("listitem", {
    name: "NotificationItem",
  });
  expect(items).toHaveLength(2);

  userEvent.click(screen.getByRole("button", { name: "close abc" }));
  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20",
    },
  ]);
});

test.todo(
  "Given Notification Center page When user filters on title Then executes correct request"
);

test.todo(
  "Given Notification Center page When user selects 2nd page Then fetches 2nd page"
);
