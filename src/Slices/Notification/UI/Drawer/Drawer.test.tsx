import { act } from "react";
import { Router } from "react-router";
import { Badge, Masthead, Page } from "@patternfly/react-core";
import { createMemoryHistory } from "@remix-run/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { links, metadata } from "@/Test/Data/Pagination";
import * as Mock from "@S/Notification/Core/Mock";
import { Drawer } from "./Drawer";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const history = createMemoryHistory();

  const closeCallback = vi.fn();
  const toggleCallback = vi.fn();

  const component = (
    <QueryClientProvider client={client}>
      <Router location={history.location} navigator={history}>
        <MockedDependencyProvider>
          <Page
            notificationDrawer={
              <Drawer onClose={closeCallback} isDrawerOpen drawerRef={{ current: null }} />
            }
            isNotificationDrawerExpanded={true}
            masthead={
              <Masthead>
                <Badge onClick={toggleCallback} />
              </Masthead>
            }
          />
        </MockedDependencyProvider>
      </Router>
    </QueryClientProvider>
  );

  return {
    component,
    closeCallback,
    history,
  };
}

let response = [Mock.unread, Mock.error, Mock.read, Mock.withoutUri];
const server = setupServer(
  http.get("/api/v2/notification", () => {
    return HttpResponse.json({ data: response, links, metadata });
  }),

  http.patch("/api/v2/notification/:id", async ({ params, request }) => {
    const id = params.id;

    const item = response.find((item) => item.id === id);
    const req = await request.json();

    if (item && req) {
      if (req["read"] !== undefined) {
        item.read = req["read"];
      }

      if (req["cleared"]) {
        response = response.filter((item) => item.id !== id);
      }
    }

    return HttpResponse.json(item);
  })
);

describe("Drawer", () => {
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    response = [Mock.unread, Mock.error, Mock.read, Mock.withoutUri];
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("Given Drawer Then a list of notifications are shown", async () => {
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("generic", { name: "NotificationDrawer" })).toBeVisible();

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Drawer When clicking on 'Clear all' Then all notifications are cleared", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "NotificationListActions" }));

    await userEvent.click(screen.getByRole("menuitem", { name: "Clear all" }));

    await waitFor(() => {
      expect(screen.queryAllByRole("listitem", { name: "NotificationItem" })).toStrictEqual([]);
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Drawer When user clicks on 'Read all' Then all notifications are read", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "NotificationListActions" }));

    await userEvent.click(screen.getByRole("menuitem", { name: "Mark all as read" }));

    const notifications = screen.getAllByRole("listitem", {
      name: "NotificationItem",
    });

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(4);

    notifications.forEach(async (notification) => {
      expect(notification).toHaveTextContent("read");
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Drawer When user clicks a notification Then it becomes read", async () => {
    const { component } = setup();

    render(component);

    const items = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });

    expect(items).toHaveLength(4);

    await userEvent.click(items[0]);

    const updatedItems = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });

    expect(updatedItems).toHaveLength(4);

    expect(updatedItems[0]).toHaveTextContent("read");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Drawer When user clicks a notification with an uri then go to the uri", async () => {
    const { component, history } = setup();

    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    const items = screen.getAllByRole("listitem", { name: "NotificationItem" });

    await userEvent.click(items[0]);

    expect(history.location.pathname).toBe("/compilereports/f2c68117-24bd-43cf-a9dc-ce42b934a614");
  });

  test("Given Drawer When user clicks a notification without an uri then nothing happens", async () => {
    const { component, history } = setup();

    render(component);

    const items = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(items[3]);

    expect(history.location.pathname).toBe("/");
  });

  test("Given Drawer When user clicks a notification toggle with an uri then do not go to uri", async () => {
    const { component, history } = setup();

    render(component);

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
    const { component } = setup();

    render(component);

    const items = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });
    const actions = within(items[2]).getByRole("button", {
      name: "NotificationListItemActions",
    });

    await userEvent.click(actions);

    await userEvent.click(screen.getByRole("menuitem", { name: "Mark as unread" }));
    const updatedItems = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });

    expect(updatedItems).toHaveLength(4);

    expect(updatedItems[2]).toHaveTextContent("unread");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given Drawer When user clicks on 'Clear' for 1 notification Then it is cleared", async () => {
    const { component } = setup();

    render(component);

    const items = await screen.findAllByRole("listitem", {
      name: "NotificationItem",
    });

    expect(items).toHaveLength(4);

    const actions = within(items[2]).getByRole("button", {
      name: "NotificationListItemActions",
    });

    await userEvent.click(actions);

    await userEvent.click(screen.getByRole("menuitem", { name: "Clear" }));

    expect(await screen.findAllByRole("listitem", { name: "NotificationItem" })).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
