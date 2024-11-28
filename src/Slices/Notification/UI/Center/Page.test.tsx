import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  defaultAuthContext,
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as Mock from "@S/Notification/Core/Mock";
import { NotificationCenterPage } from ".";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const setup = (entries?: string[]) => {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, defaultAuthContext),
  );

  const request = (query: string) => ({
    method: "GET",
    environment: "env",
    url: `/api/v2/notification${query}`,
  });

  const component = (
    <MemoryRouter initialEntries={entries}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Page>
            <NotificationCenterPage />
          </Page>
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, request };
};

test("Given Notification Center page Then fetches notifications", async () => {
  const { component, apiHelper, request } = setup();

  render(component);
  expect(apiHelper.pendingRequests).toEqual([request("?limit=20")]);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });
  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(4);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Notification Center page When user filters on severity Then executes correct request", async () => {
  const { component, apiHelper, request } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("combobox", { name: "SeverityFilterInput" }),
    );
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("option", { name: "message" }));
  });

  expect(apiHelper.pendingRequests).toEqual([
    request("?limit=20&filter.severity=message"),
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(2);

  await act(async () => {
    await userEvent.click(
      screen.getByRole("combobox", { name: "SeverityFilterInput" }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "Clear input value" }),
    );
  });

  expect(apiHelper.pendingRequests).toEqual([request("?limit=20")]);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Notification Center page When user filters on read Then executes correct request", async () => {
  const { component, apiHelper, request } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("combobox", { name: "ReadFilterInput" }),
    );
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("option", { name: "read" }));
  });

  expect(apiHelper.pendingRequests).toEqual([
    request("?limit=20&filter.read=true"),
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] }),
    );
  });

  expect(
    screen.getAllByRole("listitem", {
      name: "NotificationItem",
    }),
  ).toHaveLength(2);

  await act(async () => {
    await userEvent.click(
      screen.getByRole("combobox", { name: "ReadFilterInput" }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "Clear input value" }),
    );
  });
  expect(apiHelper.pendingRequests).toEqual([request("?limit=20")]);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Notification Center page When user filters on message Then executes correct request", async () => {
  const { component, apiHelper, request } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await act(async () => {
    await userEvent.type(
      screen.getByRole("searchbox", { name: "MessageFilter" }),
      "abc{enter}",
    );
  });

  expect(apiHelper.pendingRequests).toEqual([
    request("?limit=20&filter.message=abc"),
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] }),
    );
  });

  expect(
    screen.getAllByRole("listitem", {
      name: "NotificationItem",
    }),
  ).toHaveLength(2);

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /close abc/i }));
  });
  expect(apiHelper.pendingRequests).toEqual([request("?limit=20")]);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Notification Center page When user filters on title Then executes correct request", async () => {
  const { component, apiHelper, request } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await act(async () => {
    await userEvent.type(
      screen.getByRole("searchbox", { name: "TitleFilter" }),
      "abc{enter}",
    );
  });

  expect(apiHelper.pendingRequests).toEqual([
    request("?limit=20&filter.title=abc"),
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] }),
    );
  });

  expect(
    screen.getAllByRole("listitem", {
      name: "NotificationItem",
    }),
  ).toHaveLength(2);
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /close abc/i }));
  });
  expect(apiHelper.pendingRequests).toEqual([request("?limit=20")]);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Notification Center page When user clicks next page Then fetches next page", async () => {
  const { component, apiHelper } = setup([
    "/?state.NotificationCenter.pageSize=20",
  ]);

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });
  const button = screen.getByRole("button", { name: "Go to next page" });

  expect(button).toBeEnabled();

  await act(async () => {
    await userEvent.click(button);
  });

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v2/notification?limit=20&end=fake-param",
    },
  ]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Mock.response, data: [Mock.read, Mock.unread] }),
    );
  });

  expect(
    screen.getAllByRole("listitem", {
      name: "NotificationItem",
    }),
  ).toHaveLength(2);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
