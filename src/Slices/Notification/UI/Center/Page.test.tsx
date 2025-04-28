import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { MockedDependencyProvider } from "@/Test";
import { links, metadata } from "@/Test/Data/Pagination";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
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
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={entries}>
        <StoreProvider store={store}>
          <MockedDependencyProvider>
            <Page>
              <NotificationCenterPage />
            </Page>
          </MockedDependencyProvider>
        </StoreProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
};
const server = setupServer();

describe("NotificationCenterPage", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("Given Notification Center page THEN fetches notifications", async () => {
    server.use(
      http.get("/api/v2/notification", () => {
        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Notification Center page When user filters on severity Then executes correct request", async () => {
    server.use(
      http.get("/api/v2/notification", ({ request }) => {
        if (request.url.includes("filter.severity=message")) {
          return HttpResponse.json({
            data: [Mock.read, Mock.unread],
            links,
            metadata,
          });
        }

        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await userEvent.click(screen.getByRole("combobox", { name: "SeverityFilterInput" }));

    await userEvent.click(screen.getByRole("option", { name: "message" }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(2);

    await userEvent.click(screen.getByRole("combobox", { name: "SeverityFilterInput" }));

    await userEvent.click(screen.getByRole("button", { name: "Clear input value" }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Notification Center page When user filters on read THEN executes correct request", async () => {
    server.use(
      http.get("/api/v2/notification", ({ request }) => {
        if (request.url.includes("filter.read=true")) {
          return HttpResponse.json({
            data: [Mock.read, Mock.unread],
            links,
            metadata,
          });
        }

        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await userEvent.click(screen.getByRole("combobox", { name: "ReadFilterInput" }));

    await userEvent.click(screen.getByRole("option", { name: "read" }));

    expect(
      await screen.findAllByRole("listitem", {
        name: "NotificationItem",
      })
    ).toHaveLength(2);

    await userEvent.click(screen.getByRole("combobox", { name: "ReadFilterInput" }));

    await userEvent.click(screen.getByRole("button", { name: "Clear input value" }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Notification Center page When user filters on message Then executes correct request", async () => {
    server.use(
      http.get("/api/v2/notification", ({ request }) => {
        if (request.url.includes("filter.message=abc")) {
          return HttpResponse.json({
            data: [Mock.read, Mock.unread],
            links,
            metadata,
          });
        }

        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await userEvent.type(screen.getByRole("textbox", { name: "MessageFilter" }), "abc{enter}");

    expect(
      await screen.findAllByRole("listitem", {
        name: "NotificationItem",
      })
    ).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: /close abc/i }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Notification Center page When user filters on title Then executes correct request", async () => {
    server.use(
      http.get("/api/v2/notification", ({ request }) => {
        if (request.url.includes("filter.title=abc")) {
          return HttpResponse.json({
            data: [Mock.read, Mock.unread],
            links,
            metadata,
          });
        }

        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await userEvent.type(screen.getByRole("textbox", { name: "TitleFilter" }), "abc{enter}");

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: /close abc/i }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Notification Center page When user clicks next page Then fetches next page", async () => {
    const { component } = setup(["/?state.NotificationCenter.pageSize=20"]);

    server.use(
      http.get("/api/v2/notification", ({ request }) => {
        if (request.url.includes("end=fake-param")) {
          return HttpResponse.json({
            data: [Mock.read, Mock.unread],
            links,
            metadata,
          });
        }

        return HttpResponse.json({ data: Mock.list, links, metadata });
      })
    );

    render(component);

    const button = await screen.findByRole("button", {
      name: "Go to next page",
    });

    expect(button).toBeEnabled();

    await userEvent.click(button);

    expect(
      await screen.findAllByRole("listitem", {
        name: "NotificationItem",
      })
    ).toHaveLength(2);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
