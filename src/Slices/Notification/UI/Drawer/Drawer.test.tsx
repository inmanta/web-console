import React, { act } from "react";
import { Router } from "react-router-dom";
import { Masthead, Page } from "@patternfly/react-core";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { createMemoryHistory } from "history";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either, Maybe } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import { Body } from "@/Slices/Notification/Core/Domain";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as Mock from "@S/Notification/Core/Mock";
import { Badge } from "@S/Notification/UI/Badge";
import { Drawer } from "./Drawer";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const apiHelper = new DeferredApiHelper();
  const history = createMemoryHistory();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();

  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper),
  );

  const closeCallback = jest.fn();
  const toggleCallback = jest.fn();

  const updateRequest = (id: string, body: Body) => ({
    method: "PATCH",
    url: `/api/v2/notification/${id}`,
    environment: "env",
    body,
  });

  const getAllRequest = {
    method: "GET",
    environment: "env",
    url: "/api/v2/notification?limit=100&filter.cleared=false",
  };

  const component = (
    <StoreProvider store={store}>
      <Router location={history.location} navigator={history}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Page
            notificationDrawer={
              <Drawer
                onClose={closeCallback}
                isDrawerOpen
                drawerRef={{ current: undefined }}
              />
            }
            isNotificationDrawerExpanded={true}
            masthead={
              <Masthead>
                <Badge onClick={toggleCallback} />
              </Masthead>
            }
          />
        </DependencyProvider>
      </Router>
    </StoreProvider>
  );

  return {
    component,
    apiHelper,
    closeCallback,
    updateRequest,
    getAllRequest,
    history,
  };
}

test("Given Drawer Then a list of notifications are shown", async () => {
  const { component, apiHelper, getAllRequest } = setup();

  render(component);
  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  expect(
    screen.getByRole("generic", { name: "NotificationDrawer" }),
  ).toBeVisible();

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(4);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Drawer When clicking on 'Clear all' Then all notifications are cleared", async () => {
  const { component, apiHelper, updateRequest, getAllRequest } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await userEvent.click(
    screen.getByRole("button", { name: "NotificationListActions" }),
  );

  await userEvent.click(screen.getByRole("menuitem", { name: "Clear all" }));

  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh01", { read: true, cleared: true }),
    updateRequest("abcdefgh02", { read: true, cleared: true }),
    updateRequest("abcdefgh03", { read: true, cleared: true }),
    updateRequest("abcdefgh04", { read: true, cleared: true }),
  ]);

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(Either.right({ ...Mock.response, data: [] }));
  });

  expect(
    screen.queryByRole("listitem", { name: "NotificationItem" }),
  ).not.toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Drawer When user clicks on 'Read all' Then all notifications are read", async () => {
  const { component, apiHelper, updateRequest, getAllRequest } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await userEvent.click(
    screen.getByRole("button", { name: "NotificationListActions" }),
  );

  await userEvent.click(
    screen.getByRole("menuitem", { name: "Mark all as read" }),
  );

  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh01", { read: true }),
    updateRequest("abcdefgh02", { read: true }),
    updateRequest("abcdefgh04", { read: true }),
  ]);
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: [
          { ...Mock.unread, read: true },
          { ...Mock.error, read: true },
          Mock.read,
          { ...Mock.withoutUri, read: true },
        ],
      }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(4);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Drawer When user clicks a notification Then it becomes read", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });

  await userEvent.click(items[0]);

  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh01", { read: true }),
  ]);
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: [{ ...Mock.unread, read: true }, Mock.error, Mock.read],
      }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(3);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Drawer When user clicks a notification with an uri then go to the uri", async () => {
  const { component, apiHelper, history } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });

  await userEvent.click(items[0]);

  expect(history.location.pathname).toBe(
    "/compilereports/f2c68117-24bd-43cf-a9dc-ce42b934a614",
  );
});

test("Given Drawer When user clicks a notification without an uri then nothing happens", async () => {
  const { component, apiHelper, history } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(items[3]);

  expect(history.location.pathname).toBe("/");
});

test("Given Drawer When user clicks a notification toggle with an uri then do not go to uri", async () => {
  const { component, apiHelper, history } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("button", {
    name: "NotificationListActions",
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(items[0]);

  expect(history.location.pathname).toBe("/");
});

test("Given Drawer When user clicks on 'unread' for 1 notification Then it becomes unread", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });
  const actions = within(items[2]).getByRole("button", {
    name: "NotificationListItemActions",
  });

  await userEvent.click(actions);

  await userEvent.click(
    screen.getByRole("menuitem", { name: "Mark as unread" }),
  );

  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh03", { read: false }),
  ]);

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: [Mock.unread, Mock.error, { ...Mock.read, read: false }],
      }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(3);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given Drawer When user clicks on 'Clear' for 1 notification Then it is cleared", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();

  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });

  const actions = within(items[2]).getByRole("button", {
    name: "NotificationListItemActions",
  });

  await userEvent.click(actions);

  await userEvent.click(screen.getByRole("menuitem", { name: "Clear" }));

  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh03", { read: true, cleared: true }),
  ]);

  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: [Mock.unread, Mock.error],
      }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" }),
  ).toHaveLength(2);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
