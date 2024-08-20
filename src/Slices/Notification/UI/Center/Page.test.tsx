import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
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
    await userEvent.click(screen.getByRole("button", { name: "close abc" }));
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
    await userEvent.click(screen.getByRole("button", { name: "close abc" }));
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

test("GIVEN Notification Center WHEN filtering changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [Mock.read, Mock.unread],
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
        links: {
          self: Mock.response.links.self,
          next: "/fake-link?end=fake-first-param",
        },
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await act(async () => {
    await userEvent.click(screen.getByLabelText("Go to next page"));
  });

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).not.toMatch(/(&filter.severity=)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [Mock.read, Mock.unread],
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
        links: {
          self: "",
          next: "/fake-link?end=fake-first-param",
        },
      }),
    );
  });

  //filter on the second page
  await act(async () => {
    await userEvent.click(screen.getByLabelText("SeverityFilterInput"));
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("option", { name: "message" }));
  });

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated filtering event, and second is chained to back to the first page with still correct filtering
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(
    /(&filter.severity=message)/,
  );
});
