import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Page, PageHeader } from "@patternfly/react-core";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
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
import { Body } from "@S/Notification/Core/Model";
import { Badge } from "@S/Notification/UI/Badge";
import { Drawer } from "./Drawer";

function setup() {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();

  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, new KeycloakAuthHelper())
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
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, commandResolver }}
        >
          <Page
            notificationDrawer={
              <Drawer
                onClose={closeCallback}
                drawerRef={{ current: undefined }}
              />
            }
            isNotificationDrawerExpanded={true}
            header={
              <PageHeader headerTools={<Badge onClick={toggleCallback} />} />
            }
          />
        </DependencyProvider>
      </MemoryRouter>
    </StoreProvider>
  );

  return { component, apiHelper, closeCallback, updateRequest, getAllRequest };
}

test("Given Drawer Then a list of notifications are shown", async () => {
  const { component, apiHelper, getAllRequest } = setup();
  render(component);
  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  expect(
    screen.getByRole("generic", { name: "NotificationDrawer" })
  ).toBeVisible();

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" })
  ).toHaveLength(3);
});

test("Given Drawer When clicking on 'Clear all' Then all notifications are cleared", async () => {
  const { component, apiHelper, updateRequest, getAllRequest } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });
  userEvent.click(
    screen.getByRole("button", { name: "NotificationListActions" })
  );
  userEvent.click(screen.getByRole("menuitem", { name: "Clear all" }));
  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh01", { cleared: true }),
    updateRequest("abcdefgh02", { cleared: true }),
    updateRequest("abcdefgh03", { cleared: true }),
  ]);
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toEqual([getAllRequest]);

  await act(async () => {
    await apiHelper.resolve(Either.right({ ...Mock.response, data: [] }));
  });

  expect(
    screen.queryByRole("listitem", { name: "NotificationItem" })
  ).not.toBeInTheDocument();
});

test("Given Drawer When user clicks on 'Read all' Then all notifications are read", async () => {
  const { component, apiHelper, updateRequest, getAllRequest } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });
  userEvent.click(
    screen.getByRole("button", { name: "NotificationListActions" })
  );
  userEvent.click(screen.getByRole("menuitem", { name: "Mark all as read" }));
  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh01", { read: true }),
    updateRequest("abcdefgh02", { read: true }),
  ]);
  await act(async () => {
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
        ],
      })
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" })
  ).toHaveLength(3);
});

test("Given Drawer When user clicks a notification Then it becomes read", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });
  userEvent.click(items[0]);
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
      })
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" })
  ).toHaveLength(3);
});

test("Given Drawer When user clicks on 'Unread' for 1 notification Then it becomes unread", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });
  const actions = within(items[2]).getByRole("button", {
    name: "NotificationItemActions",
  });
  userEvent.click(actions);
  userEvent.click(screen.getByRole("button", { name: "Mark as Unread" }));
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
      })
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" })
  ).toHaveLength(3);
});

test("Given Drawer When user clicks on 'Clear' for 1 notification Then it is cleared", async () => {
  const { component, apiHelper, getAllRequest, updateRequest } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const items = screen.getAllByRole("listitem", { name: "NotificationItem" });
  const actions = within(items[2]).getByRole("button", {
    name: "NotificationItemActions",
  });
  userEvent.click(actions);
  userEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(apiHelper.pendingRequests).toEqual([
    updateRequest("abcdefgh03", { cleared: true }),
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
      })
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "NotificationItem" })
  ).toHaveLength(2);
});
